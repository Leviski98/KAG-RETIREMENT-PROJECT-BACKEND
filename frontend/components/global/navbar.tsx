"use client";

import { usePathname } from "next/navigation";
import { BellIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MobileSidebar } from "@/components/global/sidebar";
import { useDisplayIdentity } from "@/lib/hooks/use-display-identity";

const BREADCRUMB_MAP: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/districts": "Districts",
  "/dashboard/sections": "Sections",
  "/dashboard/churches": "Churches",
  "/dashboard/pastors": "Pastors",
  "/dashboard/reports": "Reports",
  "/dashboard/settings": "Settings",
  "/dashboard/testing": "Testing",
};

export function Navbar() {
  const pathname = usePathname();
  const { initials } = useDisplayIdentity();

  // Build breadcrumb segments
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; isLast: boolean }[] = [];

  let path = "";
  for (let i = 0; i < segments.length; i++) {
    path += `/${segments[i]}`;
    const label = BREADCRUMB_MAP[path] ?? segments[i];
    breadcrumbs.push({
      label: label.charAt(0).toUpperCase() + label.slice(1),
      isLast: i === segments.length - 1,
    });
  }

  return (
    <header className="flex h-14 items-center justify-between gap-2 border-b px-4 sm:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <MobileSidebar />

        {/* Breadcrumb */}
        <nav className="flex min-w-0 items-center gap-1.5 overflow-x-auto text-sm">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              {i > 0 && (
                <span className="text-muted-foreground">/</span>
              )}
              <span
                className={
                  crumb.isLast
                    ? "font-medium text-foreground"
                    : "text-primary"
                }
              >
                {crumb.label}
              </span>
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Notifications — the badge count was a hardcoded "3" with no
            notification feed behind it; nothing in the app tracks a real
            count yet, so showing none is more honest than inventing one. */}
        <Button variant="ghost" size="icon-sm">
          <BellIcon className="size-4" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User avatar */}
        <Avatar size="default">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
