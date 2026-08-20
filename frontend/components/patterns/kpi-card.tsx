import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiCardColor = "primary" | "success" | "info" | "warning" | "neutral";

// One color per meaning, shared across every page that uses this card —
// `primary` for structural totals, the rest matching the same
// success/info/warning/neutral roles used elsewhere in the app (badges,
// status dots) — so a color never has to be re-decided per page.
const COLOR_CLASSES: Record<KpiCardColor, { chip: string; icon: string }> = {
  primary: { chip: "bg-brand-50", icon: "text-brand-600" },
  success: { chip: "bg-brand-success/10", icon: "text-brand-success" },
  info: { chip: "bg-brand-info/10", icon: "text-brand-info" },
  warning: { chip: "bg-brand-warning/10", icon: "text-brand-warning" },
  neutral: { chip: "bg-muted", icon: "text-muted-foreground" },
};

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  color: KpiCardColor;
  // The one lead metric in a row (Total Districts, Total Pastors) — solid
  // brand fill so it visually leads instead of sitting flush with the rest.
  hero?: boolean;
  className?: string;
}

export function KpiCard({ icon: Icon, label, value, color, hero, className }: KpiCardProps) {
  const { chip, icon } = COLOR_CLASSES[color];

  return (
    <Card
      className={cn(
        "border-0 shadow-none",
        hero ? "bg-brand-600" : "bg-card",
        className
      )}
    >
      <CardContent className="flex items-center gap-3 p-4">
        <div
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-[10px]",
            hero ? "bg-white/15" : chip
          )}
        >
          <Icon className={cn("size-[18px]", hero ? "text-white" : icon)} />
        </div>
        <div className="flex flex-col">
          <span className={cn("text-xs", hero ? "text-brand-100" : "text-muted-foreground")}>
            {label}
          </span>
          <span className={cn("text-xl font-medium", hero ? "text-white" : "text-foreground")}>
            {typeof value === "number" ? value.toLocaleString() : value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
