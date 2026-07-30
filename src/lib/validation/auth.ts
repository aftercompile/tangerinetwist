import { z } from "zod";

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().email("Enter a valid email"),
});
export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

export const addressSchema = z.object({
  id: z.string().optional(),
  label: z.string().trim().min(1, "Label is required"),
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  addressLine: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  pin: z.string().trim().min(4, "Enter a valid PIN code"),
  isDefault: z.boolean().default(false),
});
export type AddressInput = z.infer<typeof addressSchema>;

export const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  phone: z.string().trim().min(6, "Enter a valid phone number").optional().or(z.literal("")),
});
export type ProfileInput = z.infer<typeof profileSchema>;
