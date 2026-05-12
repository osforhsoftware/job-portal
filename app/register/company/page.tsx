"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, ArrowRight, Loader2, Upload, Check, FileText, X } from "lucide-react"
import { cn, parseJsonResponse } from "@/lib/utils"

const industries = [
  "Construction", "Healthcare", "Hospitality", "IT & Technology",
  "Manufacturing", "Retail", "Finance & Banking", "Education",
  "Transportation & Logistics", "Oil & Gas", "Real Estate", "Other"
]

const companySizes = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-500 employees", "501-1000 employees", "1000+ employees"
]

const countries = [
  "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait",
  "Bahrain", "Oman", "Jordan", "Egypt", "India", "Pakistan", "Other"
]

const MAX_PROOF_MB = 10
const MAX_LOGO_MB = 2

const companyRegisterSchema = z
  .object({
    companyName: z.string().trim().min(1, "Company name is required"),
    tradeLicense: z.string().trim().min(1, "Trade license number is required"),
    industry: z.string().min(1, "Industry is required"),
    companySize: z.string().min(1, "Company size is required"),
    country: z.string().min(1, "Country is required"),
    city: z.string().trim().min(1, "City is required"),
    website: z.preprocess(
      (val) => {
        if (val == null) return ""
        const s = String(val).trim()
        return s === "" ? "" : s
      },
      z.union([
        z.literal(""),
        z.string().url("Enter a valid website URL"),
      ]),
    ),
    description: z.string().optional(),
    contactName: z.string().trim().min(1, "Contact name is required"),
    contactPosition: z.string().trim().min(1, "Position / title is required"),
    contactEmail: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    contactPhone: z.string().trim().min(1, "Phone / WhatsApp is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((v) => v === true, {
      message: "You must accept the terms and privacy policy",
    }),
    companyProof: z.string().optional(),
    logoFile: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords do not match",
        path: ["confirmPassword"],
      })
    }
  })

type CompanyRegisterValues = z.infer<typeof companyRegisterSchema>

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [companyProofFile, setCompanyProofFile] = useState<File | null>(null)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [serverError, setServerError] = useState("")
  const [uploadingProof, setUploadingProof] = useState(false)

  const form = useForm<CompanyRegisterValues>({
    resolver: zodResolver(companyRegisterSchema),
    shouldUnregister: false,
    defaultValues: {
      companyName: "",
      tradeLicense: "",
      industry: "",
      companySize: "",
      country: "",
      city: "",
      website: "",
      description: "",
      contactName: "",
      contactPosition: "",
      contactEmail: "",
      contactPhone: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
      companyProof: "",
      logoFile: "",
    },
    mode: "onSubmit",
  })

  const proofError = form.formState.errors.companyProof
  const logoError = form.formState.errors.logoFile

  const uploadCompanyProof = async (file: File): Promise<string | null> => {
    setUploadingProof(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "company-proof")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await parseJsonResponse<{ error?: string; url?: string }>(res)
      if (!res.ok) throw new Error(data.error || "Upload failed")
      if (!data.url) throw new Error("Upload did not return a file URL")
      return data.url
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : "Document upload failed")
      return null
    } finally {
      setUploadingProof(false)
    }
  }

  const goToStep2 = async () => {
    setServerError("")
    const step1Ok = await form.trigger([
      "companyName",
      "tradeLicense",
      "industry",
      "companySize",
      "country",
      "city",
      "website",
      "description",
    ])

    if (!companyProofFile) {
      form.setError("companyProof", {
        type: "manual",
        message: `Please upload a company proof document (PDF/DOC/DOCX — max ${MAX_PROOF_MB}MB)`,
      })
      return
    }
    form.clearErrors("companyProof")

    if (logoFile && logoFile.size > MAX_LOGO_MB * 1024 * 1024) {
      form.setError("logoFile", {
        type: "manual",
        message: `Logo must be under ${MAX_LOGO_MB} MB`,
      })
      return
    }
    form.clearErrors("logoFile")

    if (step1Ok) setStep(2)
  }

  const onSubmit = async (values: CompanyRegisterValues) => {
    setServerError("")
    if (!companyProofFile) {
      form.setError("companyProof", {
        type: "manual",
        message: "Please upload a proof document (PDF/DOC/DOCX)",
      })
      setStep(1)
      return
    }

    setLoading(true)
    try {
      const proofDocumentUrl = await uploadCompanyProof(companyProofFile)
      if (!proofDocumentUrl) {
        setLoading(false)
        return
      }
      const response = await fetch("/api/register/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: values.companyName,
          tradeLicense: values.tradeLicense,
          industry: values.industry,
          companySize: values.companySize,
          website: values.website || undefined,
          country: values.country,
          city: values.city,
          address: undefined,
          description: values.description || undefined,
          contactName: values.contactName,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          contactPosition: values.contactPosition,
          password: values.password,
          confirmPassword: values.confirmPassword,
          proofDocumentUrl,
        }),
      })
      const data = await parseJsonResponse<{ error?: string }>(response)
      if (!response.ok) {
        setServerError(data.error || "Registration failed")
        setLoading(false)
        return
      }
      router.push("/login/company?status=registered")
    } catch (err: unknown) {
      setServerError(
        err instanceof Error ? err.message : "Network error. Please try again.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const valid = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!valid.includes(file.type)) {
      form.setError("companyProof", {
        type: "manual",
        message: "Only PDF, DOC, or DOCX files are allowed",
      })
      return
    }
    if (file.size > MAX_PROOF_MB * 1024 * 1024) {
      form.setError("companyProof", {
        type: "manual",
        message: `File size must be under ${MAX_PROOF_MB} MB`,
      })
      return
    }
    form.clearErrors("companyProof")
    setServerError("")
    setCompanyProofFile(file)
  }

  const clearProof = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setCompanyProofFile(null)
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) {
      setLogoFile(null)
      return
    }
    if (!file.type.startsWith("image/")) {
      form.setError("logoFile", {
        type: "manual",
        message: "Please upload an image file (PNG, JPG, etc.)",
      })
      return
    }
    if (file.size > MAX_LOGO_MB * 1024 * 1024) {
      form.setError("logoFile", {
        type: "manual",
        message: `Logo must be under ${MAX_LOGO_MB} MB`,
      })
      return
    }
    form.clearErrors("logoFile")
    setLogoFile(file)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="site-container-xs">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Register Your Company</CardTitle>
              <CardDescription>
                {step === 1 ? "Company Information" : "Contact Details"}
              </CardDescription>
              <div className="mt-4 flex justify-center gap-2">
                <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {serverError && (
                    <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      {serverError}
                    </div>
                  )}

                  <div
                    className={cn("space-y-6", step !== 1 && "hidden")}
                    aria-hidden={step !== 1}
                  >
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tradeLicense"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trade License Number *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter trade license number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="companyProof"
                        render={() => (
                          <FormItem>
                            <FormLabel>Company Proof Document *</FormLabel>
                            <p className="text-sm text-muted-foreground">
                              Upload trade license or company registration (PDF, DOC, DOCX — max {MAX_PROOF_MB}MB)
                            </p>
                            <div className="flex items-center gap-4">
                              <label
                                className={cn(
                                  "flex h-20 min-w-[140px] cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 hover:border-primary",
                                  proofError ? "border-destructive" : "border-border bg-muted",
                                )}
                              >
                                <input
                                  type="file"
                                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                  className="hidden"
                                  onChange={handleProofChange}
                                />
                                {companyProofFile ? (
                                  <>
                                    <Check className="h-5 w-5 shrink-0 text-green-600" />
                                    <span className="max-w-[100px] truncate text-sm font-medium">
                                      {companyProofFile.name}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={clearProof}
                                      className="rounded p-1 hover:bg-muted-foreground/20"
                                      aria-label="Remove file"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="h-6 w-6 shrink-0 text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Upload document</span>
                                  </>
                                )}
                              </label>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="industry"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Industry *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select industry" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {industries.map((ind) => (
                                    <SelectItem key={ind} value={ind.toLowerCase()}>
                                      {ind}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companySize"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company Size *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companySizes.map((size) => (
                                    <SelectItem key={size} value={size.toLowerCase()}>
                                      {size}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {countries.map((country) => (
                                    <SelectItem key={country} value={country.toLowerCase()}>
                                      {country}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>City *</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter city" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="website"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Website (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="https://www.company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Brief description of your company..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="logoFile"
                        render={() => (
                          <FormItem>
                            <FormLabel>Company Logo (Optional)</FormLabel>
                            <div className="flex items-center gap-4">
                              <label
                                className={cn(
                                  "flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed hover:border-primary",
                                  logoError ? "border-destructive" : "border-border bg-muted",
                                )}
                              >
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleLogoChange}
                                />
                                {logoFile ? (
                                  <Check className="h-6 w-6 text-success" />
                                ) : (
                                  <Upload className="h-6 w-6 text-muted-foreground" />
                                )}
                              </label>
                              <div className="text-sm text-muted-foreground">
                                {logoFile ? logoFile.name : `PNG, JPG up to ${MAX_LOGO_MB}MB`}
                              </div>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="button" className="w-full gap-2" onClick={goToStep2}>
                        Continue
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                  </div>

                  <div
                    className={cn("space-y-6", step !== 2 && "hidden")}
                    aria-hidden={step !== 2}
                  >
                      <FormField
                        control={form.control}
                        name="contactName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Person Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Full name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPosition"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position/Title *</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., HR Manager" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Enter your email address"
                                autoComplete="email"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone / WhatsApp *</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="+971 50 123 4567"
                                autoComplete="tel"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password *</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder="Create a password (min 6 characters)"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password *</FormLabel>
                            <FormControl>
                              <PasswordInput
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={(c) => field.onChange(c === true)}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-snug">
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                I agree to the{" "}
                                <a href="/terms" className="text-primary hover:underline">
                                  Terms of Service
                                </a>{" "}
                                and{" "}
                                <a href="/privacy" className="text-primary hover:underline">
                                  Privacy Policy
                                </a>
                                . I confirm that I am authorized to register this company.
                              </FormLabel>
                              <FormMessage />
                            </div>
                          </FormItem>
                        )}
                      />

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1 bg-transparent"
                          onClick={() => {
                            setStep(1)
                            setServerError("")
                          }}
                        >
                          Back
                        </Button>
                        <Button
                          type="submit"
                          className="flex-1 gap-2"
                          disabled={loading || uploadingProof}
                        >
                          {loading || uploadingProof ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              Register Company
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </Button>
                      </div>
                  </div>

                  <div className="text-center text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <a href="/login/company" className="font-medium text-primary hover:underline">
                      Login
                    </a>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
