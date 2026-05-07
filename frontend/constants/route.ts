export const ROUTES = {
  DASHBOARD: "/dashboard",
  CHURCHES: "/dashboard/churches",
  CHURCH_DETAIL: (id: string) => `/dashboard/churches/${id}`,
  DISTRICTS: "/dashboard/districts",
  SECTIONS: "/dashboard/sections",
  PASTORS: "/dashboard/pastors",
  REPORTS: "/dashboard/reports",
  SETTINGS: "/dashboard/settings",
} as const;
