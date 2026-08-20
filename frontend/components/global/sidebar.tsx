"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDownIcon, LogOutIcon, MenuIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { sidebarItems, type SidebarItem } from "@/configs/sidebar-config";
import { useSettings } from "@/lib/hooks/use-settings";
import { useAuth } from "@/components/providers";
import { useDisplayIdentity } from "@/lib/hooks/use-display-identity";
import { useLogout } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/constants/route";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Shared between the desktop rail and the mobile drawer, so both stay in
 * sync automatically instead of two copies of the nav drifting apart.
 * `onNavigate` is only passed by the mobile drawer, to close it after a tap.
 */
function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: settings } = useSettings();
  const { user } = useAuth();
  const { name: displayName, email: displayEmail, initials } = useDisplayIdentity();
  const logout = useLogout();
  const [manuallyToggled, setManuallyToggled] = useState<Record<string, boolean>>({});

  const visibleItems = sidebarItems.filter(
    (item) => !item.adminOnly || user?.is_admin
  );

  function isGroupOpen(item: SidebarItem) {
    const autoOpen = pathname === item.href || pathname.startsWith(item.href + "/");
    return manuallyToggled[item.href] ?? autoOpen;
  }

  function toggleGroup(item: SidebarItem) {
    setManuallyToggled((prev) => ({ ...prev, [item.href]: !isGroupOpen(item) }));
  }

  function handleSignOut() {
    logout.mutate(undefined, {
      onSettled: () => {
        onNavigate?.();
        router.push(ROUTES.LANDING);
      },
    });
  }

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
        {/* Light chip so the deep-blue mark stays legible on the dark sidebar. */}
        <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
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
            <Image
              src="/images/logo.png"
              alt=""
              width={32}
              height={32}
              className="size-full object-contain p-0.5"
            />
          )}
        </div>
        <span className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
          {settings?.org_abbreviation
            ? `${settings.org_abbreviation} Retirement`
            : "KAG Retirement"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item: SidebarItem) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          if (item.children && item.children.length > 0) {
            const open = isGroupOpen(item);

            return (
              <div key={item.href}>
                <button
                  type="button"
                  onClick={() => toggleGroup(item)}
                  aria-expanded={open}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className="size-4 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDownIcon
                    className={cn(
                      "size-4 shrink-0 transition-transform",
                      open && "rotate-180"
                    )}
                  />
                </button>

                {open && (
                  <div className="mt-1 flex flex-col gap-0.5 pl-4">
                    {item.children.map((child) => {
                      const childActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                            childActive
                              ? "bg-sidebar-accent font-medium text-sidebar-foreground"
                              : "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "size-1.5 shrink-0 rounded-full",
                              childActive ? "bg-sidebar-primary" : "bg-transparent"
                            )}
                          />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
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
      <div className="shrink-0 border-t border-sidebar-border px-3 py-3">
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
    </div>
  );
}

/** Desktop rail — unchanged behaviour, hidden below the lg breakpoint. */
export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <SidebarContent />
    </aside>
  );
}

/**
 * Mobile drawer — the sidebar's only entry point below the lg breakpoint,
 * where the rail above is hidden. Without this, there was no way to
 * navigate off the current page on a phone at all.
 */
export function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" size="icon-sm" className="lg:hidden" />
        }
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">Open navigation</span>
      </SheetTrigger>
      <SheetContent
        side="left"
        showCloseButton={false}
        className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground sm:max-w-72"
      >
        <SidebarContent onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
