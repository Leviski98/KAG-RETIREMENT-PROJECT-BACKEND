"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { otpSchema } from "@/schemas/auth-schema";
import { useVerifyOtp, useResendOtp } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { ROUTES } from "@/constants/route";
import { OTP_SESSION_KEY } from "@/constants/auth";
import { FormField } from "@/components/patterns/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface OtpSession {
  otpToken: string;
  email: string;
}

export default function OtpPage() {
  const router = useRouter();
  const verifyOtp = useVerifyOtp();
  const resendOtp = useResendOtp();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string>();

  // The OTP token is handed over from the login step via sessionStorage; read it
  // once on mount (client only) rather than in an effect.
  const session = useMemo<OtpSession | null>(() => {
    if (typeof window === "undefined") return null;
    const raw = sessionStorage.getItem(OTP_SESSION_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as OtpSession;
    } catch {
      return null;
    }
  }, []);

  // No token means the user didn't come through the login step — send them back.
  useEffect(() => {
    if (!session) router.replace(ROUTES.LOGIN);
  }, [session, router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;

    const parsed = otpSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);

    verifyOtp.mutate(
      { otpToken: session.otpToken, code: parsed.data.code },
      {
        onSuccess: () => {
          sessionStorage.removeItem(OTP_SESSION_KEY);
          router.replace(ROUTES.DASHBOARD);
        },
        onError: (err) => {
          if (err instanceof ApiRequestError && err.status === 401) {
            // Pre-auth token expired — restart the sign-in.
            sessionStorage.removeItem(OTP_SESSION_KEY);
            toast.error(err.message);
            router.replace(ROUTES.LOGIN);
            return;
          }
          setError(err instanceof ApiRequestError ? err.message : "Invalid or expired code.");
        },
      }
    );
  }

  function handleResend() {
    if (!session) return;
    resendOtp.mutate(session.otpToken, {
      onSuccess: () => toast.success("A new code is on its way."),
      onError: (err) => {
        if (err instanceof ApiRequestError && err.status === 401) {
          sessionStorage.removeItem(OTP_SESSION_KEY);
          router.replace(ROUTES.LOGIN);
          return;
        }
        toast.error("Could not resend the code. Please try again.");
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enter your code</CardTitle>
        <CardDescription>
          We sent a 6-digit code to{" "}
          <strong suppressHydrationWarning>{session?.email ?? "your email"}</strong>. It expires in
          10 minutes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="One-time code" required error={error}>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className="text-center text-lg tracking-[0.5em]"
              autoFocus
            />
          </FormField>
          <Button type="submit" disabled={verifyOtp.isPending} className="w-full">
            {verifyOtp.isPending ? "Verifying..." : "Verify & sign in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={resendOtp.isPending}
            className="w-full"
          >
            {resendOtp.isPending ? "Sending..." : "Resend code"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
