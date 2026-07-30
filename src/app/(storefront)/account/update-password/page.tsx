"use client";

import { useFormState } from "react-dom";
import { updatePasswordAction } from "@/lib/actions/customer-auth-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@/components/account/AuthCard";
import { FormSubmitButton } from "@/components/account/FormSubmitButton";

export default function UpdatePasswordPage() {
  const [state, formAction] = useFormState(updatePasswordAction, undefined);

  return (
    <AuthCard eyebrow="Account" title="Set a new password">
      <form action={formAction} className="flex flex-col gap-5">
        <div>
          <Label htmlFor="password">New password</Label>
          <Input id="password" name="password" type="password" required minLength={8} autoFocus />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={8} />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <FormSubmitButton label="Update password" pendingLabel="Updating..." />
      </form>
    </AuthCard>
  );
}
