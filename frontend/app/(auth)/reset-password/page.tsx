"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { toast } from "sonner";

import { resetPasswordSchema } from "@/schemas/auth-schema";
import { useConfirmPasswordReset } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { ROUTES } from "@/constants/route";
import { FormField } from "@/components/patterns/form-field";
import { PasswordInput } from "@/components/patterns/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function ResetPasswordInner() {
  const params = useSearchParams();
  const token = params.get("token");
  const confirmReset = useConfirmPasswordReset();

  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <XCircleIcon className="size-8 text-destructive" />
          <CardTitle>Invalid reset link</CardTitle>
          <CardDescription>
            This link is missing its reset token. Request a new one from the sign-in page.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-sm font-medium text-primary hover:underline"
          >
            Request a new link
          </Link>
        </CardFooter>
      </Card>
    );
  }

  if (done) {
    return (
      <Card>
        <CardHeader>
          <CheckCircle2Icon className="size-8 text-primary" />
          <CardTitle>Password reset</CardTitle>
          <CardDescription>
            Your password has been updated. You can now sign in with your new password.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
            Go to sign in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({ password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message);
      return;
    }
    setError(undefined);
    confirmReset.mutate(
      { token: token as string, password: parsed.data.password },
      {
        onSuccess: () => setDone(true),
        onError: (err) => {
          const message =
            err instanceof ApiRequestError ? err.message : "Something went wrong. Please try again.";
          toast.error(message);
        },
      }
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose a new password</CardTitle>
        <CardDescription>Enter a new password for your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="New password" required error={error}>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" disabled={confirmReset.isPending} className="w-full">
            {confirmReset.isPending ? "Resetting..." : "Reset password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link href={ROUTES.LOGIN} className="text-sm font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
