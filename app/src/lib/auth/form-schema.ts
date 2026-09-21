import { z } from "zod"

export const loginSchema = z.object({ email: z.email().max(320), password: z.string().min(1).max(1024) })
export const signupSchema = loginSchema.extend({
  username: z.string().trim().regex(/^[A-Za-z0-9._-]{3,30}$/, "Use 3–30 letters, numbers, dots, dashes, or underscores for your handle."),
  password: z.string().min(8, "Use at least 8 characters for your password.").max(1024),
  confirmPassword: z.string(),
  terms: z.literal("on", "Accept the terms and copyright policy to continue."),
}).refine((data) => data.password === data.confirmPassword, { message: "Your passwords do not match.", path: ["confirmPassword"] })
