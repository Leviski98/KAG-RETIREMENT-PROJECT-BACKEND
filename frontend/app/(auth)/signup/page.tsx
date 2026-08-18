"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheckIcon } from "lucide-react";
import { toast } from "sonner";

import { signupSchema } from "@/schemas/auth-schema";
import { useSignup } from "@/lib/hooks/use-auth";
import { ApiRequestError } from "@/lib/api/client";
import { ROUTES } from "@/constants/route";
import { FormField } from "@/components/patterns/form-field";
import { PasswordInput } from "@/components/patterns/password-input";
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

type FieldErrors = Partial<Record<"full_name" | "email" | "password", string>>;

export default function SignupPage() {
  const signup = useSignup();
  const [form, setForm] = useState({ full_name: "", email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = signupSchema.safeParse(form);
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
    signup.mutate(parsed.data, {
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
            We sent a verification link to <strong>{form.email}</strong>. Click it to confirm
            your address. An administrator will then activate your account.
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
        <CardTitle>Create your account</CardTitle>
        <CardDescription>Sign up to request access to the KAG Retirement dashboard.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <FormField label="Full name" required error={errors.full_name}>
            <Input
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Jane Mwangi"
              autoComplete="name"
            />
          </FormField>
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
            <PasswordInput
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </FormField>
          <Button type="submit" disabled={signup.isPending} className="w-full">
            {signup.isPending ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href={ROUTES.LOGIN} className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
