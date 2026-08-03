"use client";

import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAuth } from "@/components/providers";
import { useLogout } from "@/lib/hooks/use-auth";
import { useIdleTimer } from "@/hooks/use-idle-timer";
import { ROUTES } from "@/constants/route";

/** Sign the user out after exactly 10 minutes of inactivity. */
const IDLE_TIMEOUT_MS = 10 * 60 * 1000;

interface DashboardAuthGuardProps {
  children: ReactNode;
}

export function DashboardAuthGuard({ children }: DashboardAuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const logout = useLogout();
  const logoutRef = useRef(logout);

  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleIdle = useCallback(() => {
    logoutRef.current.mutate(undefined, {
      onSettled: () => {
        toast.info("You've been signed out after 10 minutes of inactivity.");
        router.replace(ROUTES.LANDING);
      },
    });
  }, [router]);

  useIdleTimer({
    timeoutMs: IDLE_TIMEOUT_MS,
    onIdle: handleIdle,
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return children;
}