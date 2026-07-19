"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { forgotPasswordSchema } from "@/schemas/auth-schema";
import { useRequestPasswordReset } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { ROUTES } from "@/constants/route";
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

export default function ForgotPasswordPage() {
  const requestReset = useRequestPasswordReset();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    requestReset.mutate(parsed.data.email, {
      onSuccess: () => setSubmitted(true),
      onError: (err) => {
        const message =
          err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.";
        toast.error(message);
      },
    });
  }

  if (submitted) {
    return (
      <Card>
        <CardHeader>
          <MailCheckIcon className="size-8 text-primary" />
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            If an account exists for <strong>{email}</strong>, a password reset link is on
            its way. The link expires in 1 hour.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forgot your password?</CardTitle>
        <CardDescription>
          Enter your email and we&apos;ll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" required error={error}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@church.org"
              autoComplete="email"
            />
          </FormField>
          <Button type="submit" disabled={requestReset.isPending} className="w-full">
            {requestReset.isPending ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Remembered it?{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
