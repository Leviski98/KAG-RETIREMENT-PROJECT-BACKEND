import {
  LayoutDashboardIcon,
  MapIcon,
  LayersIcon,
  ChurchIcon,
  UsersIcon,
  BarChart3Icon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { ROUTES } from "@/constants/route";

export interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const sidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: ROUTES.DASHBOARD, icon: LayoutDashboardIcon },
  { label: "Districts", href: ROUTES.DISTRICTS, icon: MapIcon },
  { label: "Sections", href: ROUTES.SECTIONS, icon: LayersIcon },
  { label: "Churches", href: ROUTES.CHURCHES, icon: ChurchIcon },
  { label: "Pastors", href: ROUTES.PASTORS, icon: UsersIcon },
  { label: "Reports", href: ROUTES.REPORTS, icon: BarChart3Icon },
  { label: "Settings", href: ROUTES.SETTINGS, icon: SettingsIcon },
];
