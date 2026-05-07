"use client";

import { usePathname } from "next/navigation";
import { BellIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
    <header className="flex h-14 items-center justify-between border-b px-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm">
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

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <SearchIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search churches or pastors..."
            className="h-8 w-60 pl-8 text-xs"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon-sm" className="relative">
          <BellIcon className="size-4" />
          <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-medium text-primary-foreground">
            3
          </span>
        </Button>

        {/* User avatar */}
        <Avatar size="default">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            AK
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
