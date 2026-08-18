import type { PastorTitle } from "@/types/church";

// Pastor status options
export const PASTOR_STATUS = {
  ACTIVE: 'active',
  RETIRED: 'retired',
  DECEASED: 'deceased',
} as const;

export const PASTOR_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'retired', label: 'Retired' },
  { value: 'deceased', label: 'Deceased' },
];

export const PASTOR_STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  retired: 'Retired',
  deceased: 'Deceased',
};

// Reuses the chart-1..5 categorical set (see components/dashboard/overview.tsx)
// so a rank badge and a chart legend read as one system. The chart tokens
// already carry their own light/dark values, so no dark: variants are needed.
export const PASTOR_TITLE_COLORS: Record<PastorTitle, string> = {
  Archbishop: "bg-chart-3/15 text-chart-3",
  Bishop: "bg-chart-1/15 text-chart-1",
  Presbyter: "bg-chart-5/15 text-chart-5",
  Reverend: "bg-chart-2/15 text-chart-2",
  Pastor: "bg-muted text-muted-foreground",
};

// Map backend rank names to display names
export const PASTOR_RANK_MAP: Record<string, PastorTitle> = {
  ArchBishop: 'Archbishop',
  Bishop: 'Bishop',
  Presbyter: 'Presbyter',
  Reverend: 'Reverend',
  Pastor: 'Pastor',
};
