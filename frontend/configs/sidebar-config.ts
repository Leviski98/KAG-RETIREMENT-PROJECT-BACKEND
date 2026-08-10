import {
  LayoutDashboardIcon,
  MapIcon,
  LayersIcon,
  ChurchIcon,
  UsersIcon,
  UserCheckIcon,
  BarChart3Icon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/route";

export interface SidebarSubItem {
  label: string;
  href: string;
}

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Only shown to admin (is_staff) users. */
  adminOnly?: boolean;
  /** Optional sub-navigation shown when this item is expanded. */
  children?: SidebarSubItem[];
}

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboardIcon },
  { label: "Districts", href: ROUTES.DISTRICTS, icon: MapIcon },
  { label: "Sections", href: ROUTES.SECTIONS, icon: LayersIcon },
  { label: "Churches", href: ROUTES.CHURCHES, icon: ChurchIcon },
  { label: "Pastors", href: ROUTES.PASTORS, icon: UsersIcon },
  { label: "Reports", href: ROUTES.REPORTS, icon: BarChart3Icon },
  {
    label: "Users",
    href: ROUTES.USERS,
    icon: UserCheckIcon,
    adminOnly: true,
    children: [
      { label: "Pending approvals", href: ROUTES.USERS },
      { label: "Active users", href: ROUTES.ACTIVE_USERS },
    ],
  },
  { label: "Settings", href: ROUTES.SETTINGS, icon: SettingsIcon },
];
