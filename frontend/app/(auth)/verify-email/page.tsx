"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon, ClockIcon, XCircleIcon, Loader2Icon } from "lucide-react";

import { useResendVerificationEmail, useVerifyEmail } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { ROUTES } from "@/constants/route";
import { resendVerificationSchema } from "@/schemas/auth-schema";
import { FormField } from "@/components/patterns/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResendVerificationForm() {
  const resend = useResendVerificationEmail();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resendVerificationSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Enter a valid email address");
      return;
    }
    setError("");
    resend.mutate(parsed.data.email, { onSuccess: () => setSent(true) });
  }

  if (sent) {
    return (
      <p className="text-sm text-muted-foreground">
        If <strong>{email}</strong> needs verifying, a new link is on its way. Check your inbox.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3" noValidate>
      <FormField label="Resend the verification link" error={error}>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@church.org"
          autoComplete="email"
        />
      </FormField>
      <Button type="submit" variant="outline" disabled={resend.isPending} className="w-full">
        {resend.isPending ? "Sending..." : "Send new link"}
      </Button>
    </form>
  );
}

type Status = "verifying" | "awaiting_approval" | "verified" | "error";

function VerifyEmailInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const verifyEmail = useVerifyEmail();

  const [status, setStatus] = useState<Status>("verifying");
  const [message, setMessage] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return; // guard React 18 StrictMode double-invoke
    ran.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This link is missing its verification token.");
      return;
    }

    verifyEmail.mutate(token, {
      onSuccess: (result) => {
        setStatus(result.awaiting_approval ? "awaiting_approval" : "verified");
        setMessage(result.detail);
      },
      onError: (err) => {
        setStatus("error");
        setMessage(
          err instanceof ApiRequestError
            ? err.message
            : "We couldn't verify your email. The link may have expired."
        );
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const content = {
    verifying: {
      icon: <Loader2Icon className="size-8 animate-spin text-muted-foreground" />,
      title: "Verifying your email",
      description: "Hold on while we confirm your link.",
    },
    awaiting_approval: {
      icon: <ClockIcon className="size-8 text-brand-warning" />,
      title: "Email verified",
      description: message || "An administrator will activate your account shortly.",
    },
    verified: {
      icon: <CheckCircle2Icon className="size-8 text-primary" />,
      title: "Email verified",
      description: message || "Your account is ready. You can sign in now.",
    },
    error: {
      icon: <XCircleIcon className="size-8 text-destructive" />,
      title: "Verification failed",
      description: message,
    },
  }[status];

  return (
    <Card>
      <CardHeader>
        {content.icon}
        <CardTitle>{content.title}</CardTitle>
        <CardDescription>{content.description}</CardDescription>
      </CardHeader>
      {status !== "verifying" && (
        <>
          <CardContent>{status === "error" && <ResendVerificationForm />}</CardContent>
          <CardFooter>
            <Link
              href={ROUTES.LOGIN}
              className="text-sm font-medium text-primary hover:underline"
            >
              {status === "error" ? "Back to sign in" : "Go to sign in"}
            </Link>
          </CardFooter>
        </>
      )}
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailInner />
    </Suspense>
  );
}
