import { z } from "zod"

export const candidateRegisterSchema = z
  .object({
    fullName: z.string().trim().min(1, "Full name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    whatsapp: z.string().trim().min(1, "WhatsApp number is required"),
    gender: z.string().min(1, "Gender is required"),
    nationality: z.string().min(1, "Nationality is required"),
    dateOfBirth: z.string().optional(),
    maritalStatus: z.string().optional(),
    currentLocation: z.string().optional(),
    preferredLocationsInput: z.string().optional(),
    jobCategories: z.array(z.string()).min(1, "Please select at least one job sub-category"),
    totalExperience: z.string().min(1, "Total experience is required"),
    qualification: z.string(),
    salaryMin: z.number(),
    salaryMax: z.number(),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms and conditions",
    }),
    cvDocument: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
    if (data.salaryMin > data.salaryMax) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimum salary cannot be higher than maximum",
        path: ["salaryMax"],
      })
    }
  })

export type CandidateRegisterFormValues = z.infer<typeof candidateRegisterSchema>
