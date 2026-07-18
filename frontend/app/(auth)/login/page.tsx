"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { loginSchema } from "@/schemas/auth-schema";
import { useLogin } from "@/lib/hooks/use-auth";
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
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    login.mutate(parsed.data, {
      onSuccess: (result) => {
        sessionStorage.setItem(
          OTP_SESSION_KEY,
          JSON.stringify({ otpToken: result.otp_token, email: parsed.data.email })
        );
        toast.success("We emailed you a one-time code.");
        router.push(ROUTES.OTP);
      },
      onError: (err) => {
        const message =
          err instanceof ApiRequestError ? err.message : "Unable to sign in. Please try again.";
        toast.error(message);
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Welcome back to the KAG Retirement dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Email" required error={errors.email}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@church.org"
              autoComplete="email"
            />
          </FormField>
          <FormField label="Password" required error={errors.password}>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Your password"
              autoComplete="current-password"
            />
          </FormField>
          <div className="-mt-2 text-right">
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button type="submit" disabled={login.isPending} className="w-full">
            {login.isPending ? "Signing in..." : "Continue"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Need an account?{" "}
          <Link href={ROUTES.SIGNUP} className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
