"use client";

import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  Users,
  Building2,
  UserCheck,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  usePastorStats,
  useDistrictStats,
  useSectionStats,
  useChurchPastors,
  type ChurchPastor,
  type PastorRankCount,
  type PastorStatusCount,
} from "@/hooks/api";
import { useAuth } from "@/components/providers";
import { getDisplayName } from "@/lib/utils";

// Full class names — Tailwind's JIT only emits classes it can find as literals,
// so these can never be built by interpolation at render time. Uses the same
// chart-1..5 categorical set as the two charts below, rather than unrelated
// ad hoc hues.
const ACTIVITY_COLORS = [
  "bg-chart-1",
  "bg-chart-2",
  "bg-chart-3",
  "bg-chart-5",
  "bg-brand-700",
] as const;

// Recharts needs literal colour strings for SVG fill; var(--token) resolves
// here (unlike var(--color-token), which Tailwind's @theme inline never
// registers as a real custom property). Mirrors --chart-1..5 in globals.css.
const RANK_COLORS = [
  "var(--chart-1)",
  "var(--chart-5)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--brand-700)",
];

// active/retired/suspended map onto the same success/info/warning language
// used for badges elsewhere; deceased has no state token, so it takes the
// neutral muted-foreground colour instead of an arbitrary grey.
const statusColors: Record<string, string> = {
  active: "var(--brand-success-fill)",
  retired: "var(--brand-info-fill)",
  suspended: "var(--brand-warning-fill)",
  deceased: "var(--muted-foreground)",
};

type MetricCard = {
  label: string;
  value: number;
  change?: number;
  changeText?: string;
  icon: LucideIcon;
  color: string;
  iconColor: string;
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffWeeks = Math.floor(diffMs / 604800000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  return date.toLocaleDateString();
}

export function DashboardOverview() {
  const router = useRouter();
  const { user } = useAuth();
  const displayName = getDisplayName(user);
  const { data: pastorStats, isLoading: pastorLoading } = usePastorStats();
  const { data: districtStats, isLoading: districtLoading } =
    useDistrictStats();
  const { data: sectionStats, isLoading: sectionLoading } = useSectionStats();
  const { data: churchPastorsData, isLoading: activitiesLoading } =
    useChurchPastors();

  const isLoading =
    pastorLoading || districtLoading || sectionLoading || activitiesLoading;

  // Transform pastor stats for rank chart
  const pastorsByRankData = (pastorStats?.pastors_by_rank || [])
    .slice()
    .sort((a: PastorRankCount, b: PastorRankCount) => b.count - a.count)
    .map((item: PastorRankCount) => ({
      name: item.pastor_rank || "Unknown",
      value: item.count,
    }));

  // Transform pastor stats for status chart
  const statusOrder = ["active", "retired", "suspended", "deceased"];

  // Create a map of statuses from API data
  const statusMap = new Map<string, number>(
    (pastorStats?.pastors_by_status || []).map((item: PastorStatusCount) => [
      item.status?.toLowerCase() || "unknown",
      item.count,
    ])
  );

  // Ensure all statuses are included, even if they have 0 count
  const pastorStatusData = statusOrder.map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: statusMap.get(status) || 0,
  }));

  // statusOrder always yields four rows, so length is never a signal for
  // "no data" — the counts are.
  const totalStatusCount = pastorStatusData.reduce((sum, s) => sum + s.value, 0);

  // Build metrics data with real values. `change` is only set where the API
  // actually reports a delta; pastors have no such endpoint yet.
  const metricsData: MetricCard[] = [
    {
      label: "Total Districts",
      value: districtStats?.total_districts || 0,
      change: districtStats?.recent_districts || 0,
      changeText: "from last month",
      icon: Building2,
      color: "bg-chart-1/10",
      iconColor: "text-chart-1",
    },
    {
      label: "Total Sections",
      value: sectionStats?.total_sections || 0,
      change: sectionStats?.recent_sections || 0,
      changeText: "from last month",
      icon: Building2,
      color: "bg-chart-2/10",
      iconColor: "text-chart-2",
    },
    {
      label: "Active Pastors",
      value: pastorStats?.active_pastors || 0,
      icon: Users,
      color: "bg-chart-5/10",
      iconColor: "text-chart-5",
    },
    {
      label: "Retired Pastors",
      value: pastorStats?.retired_pastors || 0,
      icon: UserCheck,
      color: "bg-chart-3/10",
      iconColor: "text-chart-3",
    },
  ];

  // Transform recent activities.
  // Colour is picked deterministically from the row id so a re-render never
  // reshuffles avatar tints (React's purity rule bars Math.random() at render).
  const recentActivities = (churchPastorsData?.results || [])
    .slice()
    .sort(
      (a: ChurchPastor, b: ChurchPastor) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5)
    .map((assignment: ChurchPastor) => {
      const pastorName = assignment.pastor_name || "Unknown Pastor";
      const churchName = assignment.church_name || "a church";
      const roleName = assignment.role_name || "pastor";
      return {
        id: assignment.id,
        action: `${pastorName} was assigned to ${churchName} as ${roleName}`,
        time: formatTime(assignment.created_at),
        avatar: getInitials(pastorName),
        color: ACTIVITY_COLORS[assignment.id % ACTIVITY_COLORS.length],
      };
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="rounded-lg bg-linear-to-r from-brand-500 to-brand-600 p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Manage Your Church Retirement with Confidence
        </h1>
        <p className="text-primary-foreground/80">
          Welcome back, {displayName}! Here&apos;s your overview of the KAG organization.
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricsData.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card
              key={metric.label}
              className={`p-6 ${metric.color} border-0 hover:shadow-lg transition-shadow`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {metric.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {typeof metric.value === "number"
                      ? metric.value.toLocaleString()
                      : metric.value}
                  </p>
                  {metric.change ? (
                    <p className="text-xs text-muted-foreground mt-2">
                      <span className="text-brand-success font-semibold">
                        +{metric.change}
                      </span>{" "}
                      {metric.changeText}
                    </p>
                  ) : null}
                </div>
                <Icon className={`${metric.iconColor} w-8 h-8 opacity-60`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pastors by Rank - Donut Chart */}
        <Card className="p-6 bg-muted">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Pastors by Rank
          </h3>
          {pastorsByRankData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pastorsByRankData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pastorsByRankData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RANK_COLORS[index % RANK_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
                {pastorsByRankData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: RANK_COLORS[index % RANK_COLORS.length] }}
                    ></div>
                    <span className="text-foreground">
                      {item.name} {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-80 flex items-center justify-center text-muted-foreground">
              No pastor rank data available
            </div>
          )}
        </Card>

        {/* Pastor Status Distribution - Horizontal Bar */}
        <Card className="p-6 bg-muted">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Pastor Status Distribution
          </h3>
          {totalStatusCount > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={pastorStatusData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" allowDecimals={false} />
                <YAxis dataKey="name" type="category" width={95} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 8, 8, 0]}>
                  {pastorStatusData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[entry.name.toLowerCase()] || "var(--chart-1)"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No pastor status data available
            </div>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="bg-muted rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-6 text-foreground">
          Recent Activity
        </h3>
        {recentActivities.length > 0 ? (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4"
              >
                <div
                  className={`${activity.color} w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 mt-0.5`}
                >
                  {activity.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground break-words">
                    {activity.action}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground flex-shrink-0 ml-4">
                  {activity.time}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No recent activities
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => router.push("/dashboard/districts")}
          className="flex items-center justify-start gap-3 px-6 py-4 border border-border rounded-lg hover:bg-accent hover:border-input transition-all hover:shadow-sm"
        >
          <div className="text-muted-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-foreground font-medium">Add New District</span>
        </button>

        <button
          onClick={() => router.push("/dashboard/pastors")}
          className="flex items-center justify-start gap-3 px-6 py-4 border border-border rounded-lg hover:bg-accent hover:border-input transition-all hover:shadow-sm"
        >
          <div className="text-muted-foreground">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-foreground font-medium">Add New Pastor</span>
        </button>

        <button
          onClick={() => router.push("/dashboard/churches")}
          className="flex items-center justify-start gap-3 px-6 py-4 border border-border rounded-lg hover:bg-accent hover:border-input transition-all hover:shadow-sm"
        >
          <div className="text-muted-foreground">
            <Building2 className="w-5 h-5" />
          </div>
          <span className="text-foreground font-medium">View All Churches</span>
        </button>

        <button
          onClick={() => router.push("/dashboard/reports")}
          className="flex items-center justify-start gap-3 px-6 py-4 border border-border rounded-lg hover:bg-accent hover:border-input transition-all hover:shadow-sm"
        >
          <div className="text-muted-foreground">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-foreground font-medium">Generate Report</span>
        </button>
      </div>
    </div>
  );
}
