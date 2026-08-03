"use client";

import { useMemo } from "react";
import Link from "next/link";
import { 
  MapPin, 
  Layers, 
  Users, 
  UserCheck, 
  TrendingUp,
  ArrowUpRight,
  Church,
  FileText,
  Plus,
  Eye
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePastorStatistics } from "@/lib/hooks/use-pastors";
import { useDistricts } from "@/lib/hooks/use-districts";
import { useSections } from "@/lib/hooks/use-sections";
import { useChurches } from "@/lib/hooks/use-church-module";

export function DashboardOverview() {
  // Fetch statistics
  const { data: pastorStats } = usePastorStatistics();
  const { data: districtsResponse } = useDistricts();
  const { data: sectionsResponse } = useSections();
  const { data: churches } = useChurches();

  // Extract counts
  const totalDistricts = districtsResponse?.count || 0;
  const totalSections = sectionsResponse?.count || 0;
  const totalChurches = churches?.length || 0;
  const activePastors = pastorStats?.active_pastors || 0;
  const retiredPastors = pastorStats?.retired_pastors || 0;

  // Calculate percentages for charts
  const pastorsByRank = useMemo(() => {
    if (!pastorStats?.pastors_by_rank) return [];
    return pastorStats.pastors_by_rank.map((item) => ({
      label: item.pastor_rank,
      count: item.count,
      percentage: ((item.count / (pastorStats.total_pastors || 1)) * 100).toFixed(1),
    }));
  }, [pastorStats]);

  const pastorsByStatus = useMemo(() => {
    if (!pastorStats?.pastors_by_status) return [];
    const maxCount = Math.max(...pastorStats.pastors_by_status.map((s) => s.count), 1);
    return pastorStats.pastors_by_status.map((item) => ({
      label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      count: item.count,
      percentage: (item.count / maxCount) * 100,
    }));
  }, [pastorStats]);

  // Rank colors for donut chart
  const rankColors: Record<string, string> = {
    ArchBishop: "#3b82f6", // blue
    Bishop: "#8b5cf6", // purple
    Presbyter: "#06b6d4", // cyan
    Reverend: "#10b981", // green
    Pastor: "#6b7280", // gray
  };

  // Status colors for bar chart
  const statusColors: Record<string, string> = {
    Active: "#10b981", // green
    Retired: "#3b82f6", // blue
    Suspended: "#f59e0b", // amber
    Deceased: "#6b7280", // gray
  };

  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      type: "pastor_assigned",
      message: "Pastor John Kamau was assigned to KAG Westlands Community Church as Senior Pastor",
      time: "3 hours ago",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 2,
      type: "profile_updated",
      message: "Bishop Mary Wambui updated her profile information and phone number",
      time: "6 hours ago",
      icon: UserCheck,
      color: "bg-green-100 text-green-600",
    },
    {
      id: 3,
      type: "status_changed",
      message: "Pastor Peter Ochieng status changed from Active to Retired",
      time: "1 day ago",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-600",
    },
    {
      id: 4,
      type: "pastor_assigned",
      message: "Presbyter Sarah Muthoni was assigned to Grace Assembly Kilimani as Assistant Pastor",
      time: "2 days ago",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      id: 5,
      type: "district_created",
      message: 'New district "Eldoret North-RIft District" was created by Admin',
      time: "3 days ago",
      icon: MapPin,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-600 via-blue-500 to-blue-700 p-8 text-white shadow-lg">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Manage Your Church Retirement with Confidence
          </h1>
          <p className="text-blue-100 max-w-2xl">
            Welcome back, Admin! Here&apos;s your overview of the KAG organization
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20" />
        <div className="absolute bottom-0 right-20 w-40 h-40 bg-white/5 rounded-full" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* Total Districts */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  <span>Total Districts</span>
                </div>
                <div className="text-3xl font-bold">{totalDistricts}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="size-3" />
                  <span>+12% from last month</span>
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MapPin className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Sections */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Layers className="size-4" />
                  <span>Total Sections</span>
                </div>
                <div className="text-3xl font-bold">{totalSections}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="size-3" />
                  <span>+8% from last month</span>
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Layers className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Total Churches */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Church className="size-4" />
                  <span>Total Churches</span>
                </div>
                <div className="text-3xl font-bold">{totalChurches}</div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <Church className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Pastors */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="size-4" />
                  <span>Active Pastors</span>
                </div>
                <div className="text-3xl font-bold">{activePastors.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="size-3" />
                  <span>+6% from last quarter</span>
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Users className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Retired Pastors */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCheck className="size-4" />
                  <span>Retired Pastors</span>
                </div>
                <div className="text-3xl font-bold">{retiredPastors.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-emerald-600">
                  <TrendingUp className="size-3" />
                  <span>+3% this quarter</span>
                </div>
              </div>
              <div className="flex size-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <UserCheck className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Pastors by Rank - Donut Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">Pastors by Rank</h3>
            <div className="flex items-center justify-between gap-8">
              {/* Donut Chart */}
              <div className="relative flex items-center justify-center">
                <div className="relative size-48">
                  <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                    {pastorsByRank.length > 0 && (() => {
                      let currentAngle = 0;
                      return pastorsByRank.map((item, index) => {
                        const percentage = parseFloat(item.percentage);
                        const angle = (percentage / 100) * 360;
                        const startAngle = currentAngle;
                        currentAngle += angle;

                        const startX = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                        const startY = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                        const endX = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
                        const endY = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);

                        const largeArcFlag = angle > 180 ? 1 : 0;

                        const pathData = [
                          `M 50 50`,
                          `L ${startX} ${startY}`,
                          `A 40 40 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                          `Z`,
                        ].join(" ");

                        return (
                          <path
                            key={index}
                            d={pathData}
                            fill={rankColors[item.label] || "#6b7280"}
                            className="transition-opacity hover:opacity-80"
                          />
                        );
                      });
                    })()}
                    <circle cx="50" cy="50" r="20" fill="white" />
                  </svg>
                </div>
              </div>

              {/* Legend */}
              <div className="flex flex-col gap-3 flex-1">
                {pastorsByRank.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="size-3 rounded-full"
                        style={{ backgroundColor: rankColors[item.label] || "#6b7280" }}
                      />
                      <span className="text-muted-foreground">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.count}</span>
                      <Badge variant="secondary" className="text-xs">
                        {item.percentage}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pastor Status Distribution - Bar Chart */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-6">Pastor Status Distribution</h3>
            <div className="flex flex-col gap-6">
              {pastorsByStatus.map((item, index) => (
                <div key={index} className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="relative h-8 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: statusColors[item.label] || "#6b7280",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <Link href="/dashboard/reports">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="size-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="space-y-4">
            {recentActivity.map((activity) => {
              const Icon = activity.icon;
              return (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className={`flex size-10 shrink-0 items-center justify-center rounded-full ${activity.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/dashboard/districts">
          <Button size="lg" variant="outline" className="h-auto w-full flex-col gap-2 p-6">
            <Plus className="size-5" />
            <span>Add New District</span>
          </Button>
        </Link>

        <Link href="/dashboard/pastors">
          <Button size="lg" variant="outline" className="h-auto w-full flex-col gap-2 p-6">
            <Plus className="size-5" />
            <span>Add New Pastor</span>
          </Button>
        </Link>

        <Link href="/dashboard/churches">
          <Button size="lg" variant="outline" className="h-auto w-full flex-col gap-2 p-6">
            <Eye className="size-5" />
            <span>View All Churches</span>
          </Button>
        </Link>

        <Link href="/dashboard/reports">
          <Button size="lg" variant="outline" className="h-auto w-full flex-col gap-2 p-6">
            <FileText className="size-5" />
            <span>Generate Report</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
