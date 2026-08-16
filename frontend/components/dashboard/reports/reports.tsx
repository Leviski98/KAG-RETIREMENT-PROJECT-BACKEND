"use client";

import {
  Download,
  Calendar,
  CheckCircle,
  ChevronDown,
  Clock,
  FileText,
  Loader2,
  MapPin,
  Printer,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useDistrictSummaryReport,
  usePastorDemographicsReport,
  useDownloadDistrictSummaryPDF,
  useDownloadPastorDemographicsPDF,
} from "@/lib/hooks/use-reports";
import type {
  DistrictSummaryReport,
  PastorDemographicsReport,
  ReportMetric,
  ReportType,
} from "@/types/report";

type ReportCard = {
  type: ReportType;
  title: string;
  description: string;
  icon: LucideIcon;
  iconClassName: string;
  iconWrapClassName: string;
  fallbackMetrics: ReportMetric[];
};

type RecentReport = {
  type: ReportType;
  name: string;
  category: string;
  date: string;
};

const reportCards: ReportCard[] = [
  {
    type: "district-summary",
    title: "District Summary Report",
    description:
      "Comprehensive overview of all districts including section counts, church statistics, and pastoral coverage across the KAG organization.",
    icon: MapPin,
    iconClassName: "text-primary",
    iconWrapClassName: "bg-brand-50",
    fallbackMetrics: [
      { label: "Districts", value: "-" },
      { label: "Sections", value: "-" },
      { label: "Churches", value: "-" },
    ],
  },
  {
    type: "pastor-demographics",
    title: "Pastor Demographics Report",
    description:
      "Printable district and section report of pastors including rank, status, age, service years, projected retirement, and remaining tenure.",
    icon: Users,
    iconClassName: "text-brand-success",
    iconWrapClassName: "bg-brand-success/10",
    fallbackMetrics: [
      { label: "Pastors", value: "-" },
      { label: "Active", value: "-" },
      { label: "Avg. Service", value: "-" },
    ],
  },
];

const recentReports: RecentReport[] = [
  {
    type: "district-summary",
    name: "District Summary Live Report",
    category: "District Summary",
    date: "Live data",
  },
  {
    type: "pastor-demographics",
    name: "Pastor Demographics Live Report",
    category: "Pastor Demographics",
    date: "Live data",
  },
];

export function ReportsManager() {
  const [activeReport, setActiveReport] = useState<ReportType | null>(null);

  // Always enabled so metric cards populate on page load
  const districtSummary = useDistrictSummaryReport(true);
  const pastorDemographics = usePastorDemographicsReport(true);

  const downloadDistrictPDF = useDownloadDistrictSummaryPDF();
  const downloadPastorPDF = useDownloadPastorDemographicsPDF();

  const reportMetrics = useMemo<Record<ReportType, ReportMetric[]>>(
    () => ({
      "district-summary":
        districtSummary.data?.metrics ?? reportCards[0].fallbackMetrics,
      "pastor-demographics":
        pastorDemographics.data?.metrics ?? reportCards[1].fallbackMetrics,
    }),
    [districtSummary.data?.metrics, pastorDemographics.data?.metrics]
  );

  // Generating = user triggered a preview but data hasn't arrived yet
  const isGenerating =
    (activeReport === "district-summary" && districtSummary.isLoading) ||
    (activeReport === "pastor-demographics" && pastorDemographics.isLoading);

  const activeError =
    activeReport === "district-summary"
      ? districtSummary.error
      : activeReport === "pastor-demographics"
        ? pastorDemographics.error
        : null;

  const downloadError = downloadDistrictPDF.error ?? downloadPastorPDF.error;

  // Toggle: clicking the same active type collapses the preview
  const handlePreview = (type: ReportType) => {
    setActiveReport((prev) => (prev === type ? null : type));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[28px] font-extrabold tracking-normal text-foreground">
            Reports & Analytics
          </h1>
          <p className="mt-1 text-[15px] leading-6 text-muted-foreground">
            Preview and download live district summaries and pastor demographic
            reports.
          </p>
        </div>

        <Button
          variant="outline"
          className="h-11 w-full justify-between rounded-xl border-border bg-brand-50 px-5 text-sm font-semibold text-foreground shadow-none sm:w-[116px]"
        >
          All Time
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </div>

      {/* Report cards */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {reportCards.map((report) => {
          const isDownloading =
            report.type === "district-summary"
              ? downloadDistrictPDF.isPending
              : downloadPastorPDF.isPending;
          return (
            <ReportCardItem
              key={report.title}
              report={report}
              metrics={reportMetrics[report.type]}
              isActive={activeReport === report.type}
              isGenerating={activeReport === report.type && isGenerating}
              isDownloading={isDownloading}
              onPreview={() => handlePreview(report.type)}
              onDownload={
                report.type === "district-summary"
                  ? () => downloadDistrictPDF.mutate()
                  : () => downloadPastorPDF.mutate()
              }
            />
          );
        })}
      </div>

      {/* ── Preview panel — sits between cards and Recent Reports ── */}

      {isGenerating && (
        <div className="flex min-h-[180px] items-center justify-center rounded-2xl border border-dashed border-brand-200 bg-brand-50">
          <div className="flex items-center gap-3 text-sm font-bold text-primary">
            <Loader2 className="size-5 animate-spin" />
            Generating report preview…
          </div>
        </div>
      )}

      {activeError && (
        <Card className="rounded-2xl border-destructive/25 bg-destructive/5 shadow-none">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-destructive">
              Unable to generate this report.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeError instanceof Error
                ? activeError.message
                : "Please confirm the backend API is running and try again."}
            </p>
          </CardContent>
        </Card>
      )}

      {activeReport === "district-summary" && districtSummary.data && (
        <DistrictSummaryPreview report={districtSummary.data} />
      )}

      {activeReport === "pastor-demographics" && pastorDemographics.data && (
        <PastorDemographicsPreview report={pastorDemographics.data} />
      )}

      {/* ── Recent reports ── */}
      <RecentReportsTable reports={recentReports} onPreview={handlePreview} />

      {/* Download error — only visible on failure */}
      {downloadError && (
        <Card className="rounded-2xl border-destructive/25 bg-destructive/5 shadow-none">
          <CardContent className="p-6">
            <p className="text-sm font-bold text-destructive">
              Failed to download PDF.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {downloadError instanceof Error
                ? downloadError.message
                : "Please confirm the backend API is running and try again."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Report card ──────────────────────────────────────────────────────────────

function ReportCardItem({
  report,
  metrics,
  isActive,
  isGenerating,
  isDownloading,
  onPreview,
  onDownload,
}: {
  report: ReportCard;
  metrics: ReportMetric[];
  isActive: boolean;
  isGenerating: boolean;
  isDownloading: boolean;
  onPreview: () => void;
  onDownload: () => void;
}) {
  const Icon = report.icon;

  return (
    <Card className="rounded-2xl border-border bg-white shadow-[0_4px_18px_rgba(15,23,42,0.07)]">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div
            className={`flex size-14 shrink-0 items-center justify-center rounded-2xl ${report.iconWrapClassName}`}
          >
            <Icon className={`size-7 ${report.iconClassName}`} />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold tracking-normal text-foreground">
              {report.title}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {report.description}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-brand-50 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="border-b border-border px-4 py-4 last:border-b-0 sm:border-r sm:border-b-0 sm:last:border-r-0"
            >
              <p className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground">
                {metric.label}
              </p>
              <p className="mt-1 text-lg font-extrabold leading-none text-foreground">
                {metric.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <Button
            className="h-12 flex-1 rounded-xl bg-linear-to-r from-brand-600 to-brand-400 text-sm font-extrabold text-white shadow-none hover:from-brand-700 hover:to-brand-500"
            onClick={onPreview}
            disabled={isGenerating || isDownloading}
            aria-label={`Preview ${report.title}`}
          >
            {isGenerating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <FileText className="size-5" />
            )}
            {isActive ? "Hide Preview" : "Preview"}
          </Button>
          <Button
            className="h-12 flex-1 rounded-xl border-2 border-primary bg-white text-sm font-extrabold text-primary shadow-none hover:bg-brand-50"
            onClick={onDownload}
            disabled={isGenerating || isDownloading}
            aria-label={`Download ${report.title} as PDF`}
          >
            {isDownloading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Download className="size-5" />
            )}
            {isDownloading ? "Downloading…" : "Download PDF"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Recent reports table ─────────────────────────────────────────────────────

function RecentReportsTable({
  reports,
  onPreview,
}: {
  reports: RecentReport[];
  onPreview: (type: ReportType) => void;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border bg-white shadow-[0_4px_18px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-50">
            <Clock className="size-4 text-primary" />
          </div>
          <h2 className="text-base font-extrabold text-foreground">
            Recent Reports
          </h2>
        </div>
        <p className="text-sm font-medium text-muted-foreground">
          {reports.length} reports
        </p>
      </div>

      <Table>
        <TableHeader className="bg-brand-50">
          <TableRow className="border-border hover:bg-brand-50">
            <TableHead className="h-11 px-6 text-[11px] font-extrabold uppercase tracking-normal text-muted-foreground">
              Report Name
            </TableHead>
            <TableHead className="h-11 px-6 text-[11px] font-extrabold uppercase tracking-normal text-muted-foreground">
              Type
            </TableHead>
            <TableHead className="h-11 px-6 text-[11px] font-extrabold uppercase tracking-normal text-muted-foreground">
              Date
            </TableHead>
            <TableHead className="h-11 px-6 text-[11px] font-extrabold uppercase tracking-normal text-muted-foreground">
              Status
            </TableHead>
            <TableHead className="h-11 px-6 text-right text-[11px] font-extrabold uppercase tracking-normal text-muted-foreground">
              Action
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow
              key={report.name}
              className="border-border hover:bg-brand-50"
            >
              <TableCell className="min-w-[270px] px-6 py-5">
                <div className="flex items-center gap-3">
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="font-extrabold text-foreground">
                    {report.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="min-w-[210px] px-6 py-5">
                <span className="rounded-md bg-brand-50 px-2.5 py-1 text-xs font-extrabold text-primary">
                  {report.category}
                </span>
              </TableCell>
              <TableCell className="min-w-[160px] px-6 py-5">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="size-4 text-muted-foreground" />
                  {report.date}
                </div>
              </TableCell>
              <TableCell className="min-w-[130px] px-6 py-5">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-success/10 px-3 py-1.5 text-xs font-extrabold text-brand-success">
                  <CheckCircle className="size-3.5" />
                  Ready
                </span>
              </TableCell>
              <TableCell className="min-w-[140px] px-6 py-5 text-right">
                <Button
                  variant="link"
                  className="h-auto gap-1.5 px-0 text-sm font-extrabold text-primary hover:no-underline"
                  onClick={() => onPreview(report.type)}
                >
                  <Printer className="size-4" />
                  Preview
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

// ─── Preview shells ───────────────────────────────────────────────────────────

function PrintableReportShell({
  reportTitle,
  generatedAt,
  children,
}: {
  reportTitle: string;
  generatedAt: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-white p-4 shadow-[0_4px_18px_rgba(15,23,42,0.07)] sm:p-8">
      <div className="border-b border-border pb-6 text-center">
        <p className="text-lg font-extrabold uppercase tracking-normal text-foreground">
          KAG Retirement Management System
        </p>
        <h2 className="mt-2 text-lg font-extrabold uppercase tracking-normal text-foreground">
          {reportTitle}
        </h2>
        <p className="mt-2 text-xs font-semibold text-muted-foreground">
          Generated {new Date(generatedAt).toLocaleString()}
        </p>
      </div>
      <div className="pt-6">{children}</div>
    </section>
  );
}

function ReportTotal({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-border bg-brand-50 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-normal text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-extrabold text-foreground">{value}</p>
    </div>
  );
}

function DistrictSummaryPreview({
  report,
}: {
  report: DistrictSummaryReport;
}) {
  return (
    <PrintableReportShell
      reportTitle={report.title}
      generatedAt={report.generated_at}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ReportTotal label="Districts" value={report.totals.districts} />
        <ReportTotal label="Sections" value={report.totals.sections} />
        <ReportTotal label="Churches" value={report.totals.churches} />
        <ReportTotal
          label="Assigned Pastors"
          value={report.totals.assigned_pastors}
        />
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-sm font-extrabold uppercase tracking-normal text-report-heading">
          District Summary
        </h3>
        <div className="overflow-x-auto">
          <Table className="min-w-[760px] border border-report-grid">
            <TableHeader className="bg-report-header">
              <TableRow className="border-report-grid hover:bg-report-header">
                {[
                  "ID",
                  "District",
                  "Sections",
                  "Churches",
                  "Assigned Pastors",
                ].map((h) => (
                  <TableHead
                    key={h}
                    className="border border-report-grid px-3 py-2 text-xs font-extrabold text-white"
                  >
                    {h}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.districts.length > 0 ? (
                report.districts.map((d, i) => (
                  <TableRow
                    key={d.district_id}
                    className={
                      i % 2 === 0
                        ? "bg-report-row hover:bg-report-row"
                        : "bg-report-row-alt hover:bg-report-row-alt"
                    }
                  >
                    <PastorCell>{d.district_id}</PastorCell>
                    <PastorCell className="font-bold">
                      {d.district_name}
                    </PastorCell>
                    <PastorCell>{d.sections}</PastorCell>
                    <PastorCell>{d.churches}</PastorCell>
                    <PastorCell>{d.assigned_pastors}</PastorCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="border border-report-grid px-3 py-6 text-center text-sm text-muted-foreground"
                  >
                    No district data available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </PrintableReportShell>
  );
}

function PastorDemographicsPreview({
  report,
}: {
  report: PastorDemographicsReport;
}) {
  return (
    <PrintableReportShell
      reportTitle={report.title}
      generatedAt={report.generated_at}
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ReportTotal label="Pastors" value={report.totals.total_pastors} />
        <ReportTotal label="Active" value={report.totals.active_pastors} />
        <ReportTotal label="Retired" value={report.totals.retired_pastors} />
        <ReportTotal
          label="Avg. Service"
          value={`${report.totals.average_years_served} yrs`}
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DemographicList title="Gender" rows={report.by_gender} />
        <DemographicList title="Rank" rows={report.by_rank} />
        <DemographicList title="Status" rows={report.by_status} />
      </div>

      <div className="mt-8 space-y-8">
        {report.districts.length > 0 ? (
          report.districts.map((district) => (
            <div key={district.district_id}>
              <h3 className="text-sm font-extrabold uppercase tracking-normal text-report-heading">
                {district.district_name}
              </h3>
              <div className="mt-4 space-y-6">
                {district.sections.map((section) => (
                  <div key={section.section_id}>
                    <h4 className="mb-3 text-sm font-extrabold italic text-foreground">
                      Section: {section.section_name.toUpperCase()}
                    </h4>
                    <div className="overflow-x-auto">
                      <Table className="min-w-[980px] border border-report-grid">
                        <TableHeader className="bg-report-header">
                          <TableRow className="border-report-grid hover:bg-report-header">
                            {[
                              "ID",
                              "Name",
                              "Rank",
                              "Status",
                              "Age",
                              "Years Served",
                              "Proj. Retirement",
                              "Remaining Tenure",
                            ].map((h) => (
                              <TableHead
                                key={h}
                                className="border border-report-grid px-3 py-2 text-xs font-extrabold text-white"
                              >
                                {h}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {section.pastors.map((pastor, i) => (
                            <TableRow
                              key={`${section.section_id}-${pastor.pastor_id}`}
                              className={
                                i % 2 === 0
                                  ? "bg-report-row hover:bg-report-row"
                                  : "bg-report-row-alt hover:bg-report-row-alt"
                              }
                            >
                              <PastorCell>{pastor.pastor_id}</PastorCell>
                              <PastorCell className="font-bold">
                                {pastor.name}
                              </PastorCell>
                              <PastorCell>{pastor.rank}</PastorCell>
                              <PastorCell>{pastor.status}</PastorCell>
                              <PastorCell>{pastor.age ?? "-"}</PastorCell>
                              <PastorCell>
                                {pastor.years_served === null
                                  ? "-"
                                  : `${pastor.years_served} yrs`}
                              </PastorCell>
                              <PastorCell>
                                {pastor.projected_retirement}
                              </PastorCell>
                              <PastorCell>{pastor.remaining_tenure}</PastorCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
            No pastor assignment data available for this report.
          </div>
        )}
      </div>
    </PrintableReportShell>
  );
}

function DemographicList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; count: number }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-white">
      <div className="border-b border-border bg-brand-50 px-4 py-3">
        <h3 className="text-xs font-extrabold uppercase tracking-normal text-report-header">
          {title}
        </h3>
      </div>
      <div className="divide-y divide-border">
        {rows.length > 0 ? (
          rows.map((row) => (
            <div
              key={`${title}-${row.label}`}
              className="flex items-center justify-between px-4 py-2 text-sm"
            >
              <span className="font-semibold text-foreground">{row.label}</span>
              <span className="font-extrabold text-primary">{row.count}</span>
            </div>
          ))
        ) : (
          <p className="px-4 py-4 text-sm text-muted-foreground">No data available.</p>
        )}
      </div>
    </div>
  );
}

function PastorCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <TableCell
      className={`border border-report-grid px-3 py-2 text-xs text-foreground ${className}`}
    >
      {children}
    </TableCell>
  );
}
