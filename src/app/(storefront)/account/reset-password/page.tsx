"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { requestPasswordResetAction } from "@/lib/actions/customer-auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/account/AuthCard";
import { FormSubmitButton } from "@/components/account/FormSubmitButton";

export default function ResetPasswordPage() {
  const [state, formAction] = useFormState(requestPasswordResetAction, undefined);

  return (
    <AuthCard eyebrow="Account" title="Reset your password" description="We'll email you a link to set a new one.">
      {state?.success ? (
        <p className="text-sm text-charcoal">
          If an account exists for that email, a reset link is on its way — check your inbox.
        </p>
      ) : (
        <form action={formAction} className="flex flex-col gap-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </div>
          {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
          <FormSubmitButton label="Send reset link" pendingLabel="Sending..." />
        </form>
      )}
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/account/login" className="font-medium text-charcoal underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  );
}
