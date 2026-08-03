"use client";

import * as React from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { useSearchParams } from "next/navigation";
import { signUpAction } from "@/lib/actions/customer-auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/account/AuthCard";
import { FormSubmitButton } from "@/components/account/FormSubmitButton";
import { GoogleSignInButton } from "@/components/account/GoogleSignInButton";

function SignUpForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/account";
  const [state, formAction] = useFormState(signUpAction, undefined);

  return (
    <div className="flex flex-col gap-5">
      <GoogleSignInButton from={from} />
      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="from" value={from} />
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" name="fullName" required autoFocus />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" type="tel" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <FormSubmitButton label="Create Account" pendingLabel="Creating account..." />
        <p className="text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href="/account/login" className="font-medium text-charcoal underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function AccountSignUpPage() {
  return (
    <AuthCard eyebrow="Account" title="Create an account" description="Save addresses and track your orders.">
      <React.Suspense fallback={null}>
        <SignUpForm />
      </React.Suspense>
    </AuthCard>
  );
}
