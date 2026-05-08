"use client";

import { PageHeader } from "@/components/global/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Calendar, TrendingUp } from "lucide-react";

export function ReportsManager() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <PageHeader
        title="Reports"
        description="Generate and view reports for churches, pastors, and districts."
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <FileText className="size-6 text-brand-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Total Reports</span>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Download className="size-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Downloads</span>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30">
              <Calendar className="size-6 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">This Month</span>
              <span className="text-2xl font-bold">0</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="size-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Growth</span>
              <span className="text-2xl font-bold">0%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center rounded-lg border border-dashed p-12">
        <div className="flex flex-col items-center gap-2 text-center">
          <FileText className="size-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold">Reports Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-md">
            Report generation and viewing features are under development. You will be able to
            generate church statistics, pastor assignments, and district reports here.
          </p>
        </div>
      </div>
    </div>
  );
}
