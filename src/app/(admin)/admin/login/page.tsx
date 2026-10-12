"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/lib/actions/auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/shared/Logo";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="accent" size="lg" className="w-full" disabled={pending}>
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "";
  const [state, formAction] = useFormState(loginAction, undefined);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      <input type="hidden" name="from" value={from} />
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" required autoFocus />
      </div>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <SubmitButton />
    </form>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-5">
      <div className="w-full max-w-sm rounded-3xl bg-warm-white p-8 shadow-lift">
        <div className="flex items-center gap-3">
          <Logo markClassName="h-9 sm:h-9" wordmarkClassName="text-[1.2rem] sm:text-[1.2rem]" />
          <span className="rounded-full bg-beige px-2.5 py-1 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-muted">
            Admin
          </span>
        </div>
        <p className="mt-2 text-sm text-muted">Sign in to manage products and orders.</p>

        <React.Suspense fallback={null}>
          <LoginForm />
        </React.Suspense>
      </div>
    </div>
  );
}
