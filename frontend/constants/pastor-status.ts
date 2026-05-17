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

export const PASTOR_TITLE_COLORS: Record<PastorTitle, string> = {
  Archbishop: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
  Bishop: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Presbyter: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  Reverend: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  Pastor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
};

// Map backend rank names to display names
export const PASTOR_RANK_MAP: Record<string, PastorTitle> = {
  ArchBishop: 'Archbishop',
  Bishop: 'Bishop',
  Presbyter: 'Presbyter',
  Reverend: 'Reverend',
  Pastor: 'Pastor',
};
