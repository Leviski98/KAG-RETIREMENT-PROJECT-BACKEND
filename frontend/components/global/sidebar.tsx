"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOutIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { sidebarItems, type SidebarItem } from "@/configs/sidebar-config";
import { useSettings } from "@/lib/hooks/use-settings";
import { useAuth } from "@/components/providers";
import { useLogout } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/constants/route";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: settings } = useSettings();
  const { user } = useAuth();
  const logout = useLogout();

  const displayName = user?.full_name || settings?.account_display_name || "System Administrator";
  const displayEmail = user?.email || settings?.account_email || "";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const visibleItems = sidebarItems.filter(
    (item) => !item.adminOnly || user?.is_admin
  );

  function handleSignOut() {
    logout.mutate(undefined, {
      onSettled: () => router.push(ROUTES.LANDING),
    });
  }

  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          {settings?.org_logo ? (
            <Image
              src={settings.org_logo}
              alt="Organization logo"
              width={32}
              height={32}
              unoptimized
              className="size-8 rounded-lg object-cover"
            />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
              <path d="m9 16 3-8 3 8" />
            </svg>
          )}
        </div>
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          {settings?.org_abbreviation ? `${settings.org_abbreviation} Retire` : "KAG Retire"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleItems.map((item: SidebarItem) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="border-t border-sidebar-border px-3 py-3">
        <div className="flex items-center gap-3">
          <Avatar size="default">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              {displayName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground/50">
              {displayEmail}
            </p>
          </div>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleSignOut}
                  disabled={logout.isPending}
                  className="text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                />
              }
            >
              <LogOutIcon className="size-3.5" />
            </TooltipTrigger>
            <TooltipContent>Sign out</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
}
