import { z } from "zod"

export const emailPasswordLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export type EmailPasswordLoginValues = z.infer<typeof emailPasswordLoginSchema>
