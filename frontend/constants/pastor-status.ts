import type { PastorTitle } from "@/types/church";

export const PASTOR_TITLE_COLORS: Record<PastorTitle, string> = {
  Reverend: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
  Bishop: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  Pastor: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  Presbyter: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
};
