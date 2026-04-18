"use client"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Loader2, CheckCircle, Upload, FileText, X, Clock } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

const agencyRegisterSchema = z
  .object({
    name: z.string().trim().min(1, "Agency name is required"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Enter a valid email address"),
    phone: z.string().trim().min(1, "Phone number is required"),
    password: z.string().min(1, "Password is required").min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    proofDocument: z.string().optional(),
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

type AgencyRegisterValues = z.infer<typeof agencyRegisterSchema>

export default function AgencyRegisterPage() {
  const [proofFile, setProofFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [registered, setRegistered] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<AgencyRegisterValues>({
    resolver: zodResolver(agencyRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      proofDocument: "",
    },
    mode: "onSubmit",
  })

  const ACCEPTED_DOC_TYPES = ".pdf,.doc,.docx"
  const MAX_SIZE_MB = 10

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!validTypes.includes(file.type)) {
      form.setError("proofDocument", {
        type: "manual",
        message: "Only PDF, DOC, or DOCX files are allowed",
      })
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      form.setError("proofDocument", {
        type: "manual",
        message: `File size must be under ${MAX_SIZE_MB} MB`,
      })
      return
    }

    form.clearErrors("proofDocument")
    setServerError("")
    setProofFile(file)
  }

  const removeFile = () => {
    setProofFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const uploadProofDocument = async (): Promise<string | null> => {
    if (!proofFile) return null
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", proofFile)
      fd.append("type", "agency-proof")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      return data.url
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Document upload failed"
      setServerError(message)
      return null
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (values: AgencyRegisterValues) => {
    setServerError("")

    if (!proofFile) {
      form.setError("proofDocument", {
        type: "manual",
        message: "Please upload a proof document (PDF/DOC/DOCX)",
      })
      return
    }

    setLoading(true)

    try {
      const proofUrl = await uploadProofDocument()
      if (!proofUrl) {
        setLoading(false)
        return
      }

      const response = await fetch("/api/register/agency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          password: values.password,
          proofDocumentUrl: proofUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || "Registration failed")
        setLoading(false)
        return
      }

      setRegistered(true)
    } catch {
      setServerError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const proofDocError = form.formState.errors.proofDocument

  if (registered) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="site-container flex flex-1 items-center justify-center bg-background py-12">
          <Card className="w-full max-w-md text-center">
            <CardHeader className="space-y-1">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-2xl font-bold">Registration Submitted</CardTitle>
              <CardDescription className="text-base">
                Your agency registration has been submitted successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-foreground">
                <p className="font-medium mb-1">Pending Admin Approval</p>
                <p className="text-muted-foreground">
                  Your account is under review. You will be able to access your dashboard once the
                  super admin approves your registration. This usually takes 1-2 business days.
                </p>
              </div>
              <Link href="/login/agency">
                <Button variant="outline" className="w-full">
                  Go to Login Page
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="site-container flex flex-1 items-center justify-center bg-background py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">Agency Registration</CardTitle>
            <CardDescription>Register your recruitment agency</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {serverError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {serverError}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agency Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ABC Recruitment Agency"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="agency@example.com"
                          autoComplete="email"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+971 50 123 4567"
                          autoComplete="tel"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="proofDocument"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Proof Document *{" "}
                        <span className="text-xs text-muted-foreground font-normal">
                          (PDF, DOC, or DOCX — max {MAX_SIZE_MB}MB)
                        </span>
                      </FormLabel>
                      {proofFile ? (
                        <div
                          className={cn(
                            "flex items-center gap-3 rounded-lg border bg-muted/30 p-3",
                            proofDocError ? "border-destructive" : "border-border",
                          )}
                        >
                          <FileText className="h-5 w-5 shrink-0 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">{proofFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(proofFile.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={removeFile}
                            disabled={loading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault()
                              fileInputRef.current?.click()
                            }
                          }}
                          className={cn(
                            "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/30",
                            proofDocError ? "border-destructive" : "border-border",
                          )}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            Click to upload proof document
                          </p>
                          <p className="text-xs text-muted-foreground">PDF, DOC, DOCX</p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept={ACCEPTED_DOC_TYPES}
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={loading}
                      />
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
                          placeholder="Enter password"
                          autoComplete="new-password"
                          disabled={loading}
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
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading || uploading}>
                  {loading || uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {uploading ? "Uploading document..." : "Registering..."}
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Register Agency
                    </>
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login/agency" className="text-primary hover:underline">
                    Login here
                  </Link>
                </p>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}
