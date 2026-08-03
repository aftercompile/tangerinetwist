"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signInAction } from "@/lib/actions/customer-auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/account/AuthCard";
import { FormSubmitButton } from "@/components/account/FormSubmitButton";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";

function LoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/account";
  const oauthError = searchParams.get("error");
  const [state, formAction] = useFormState(signInAction, undefined);

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton from={from} />
      {oauthError && <p className="text-center text-sm text-red-600">Google sign-in failed. Please try again.</p>}
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="from" value={from} />
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoFocus />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/account/reset-password" className="text-xs font-medium text-tangerine-600 hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <FormSubmitButton label="Sign In" pendingLabel="Signing in..." />
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/account/signup" className="font-medium text-charcoal underline-offset-4 hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function AccountLoginPage() {
  return (
    <AuthCard eyebrow="Account" title="Sign in" description="Access your order history and saved addresses.">
      <React.Suspense fallback={null}>
        <LoginForm />
      </React.Suspense>
    </AuthCard>
  );
}
