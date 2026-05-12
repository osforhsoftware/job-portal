"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Building2, Loader2 } from "lucide-react"
import {
  emailPasswordLoginSchema,
  type EmailPasswordLoginValues,
} from "@/lib/validation/email-password-login"

export default function CompanyLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")
  const [info, setInfo] = useState("")

  const form = useForm<EmailPasswordLoginValues>({
    resolver: zodResolver(emailPasswordLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  useEffect(() => {
    const status = searchParams.get("status")
    const pendingError = searchParams.get("error")

    if (status === "registered") {
      setInfo(
        "Your company registration has been submitted successfully. Our admin team is reviewing your details. You will be notified once your account is approved.",
      )
    }

    if (pendingError === "pending") {
      setServerError(
        "Your account is currently under review by the administrator. Please wait until your company details are verified and approved.",
      )
    } else if (pendingError === "rejected") {
      setServerError(
        "Unfortunately, your registration could not be approved. Please contact support for assistance.",
      )
    }
  }, [searchParams])

  const onSubmit = async (values: EmailPasswordLoginValues) => {
    setServerError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || "Login failed")
        setLoading(false)
        return
      }

      if (
        data.user.role !== "company" &&
        data.user.role !== "corporate" &&
        data.user.role !== "staff"
      ) {
        setServerError("Invalid account type. Use company login for company accounts.")
        setLoading(false)
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", `company_token_${crypto.randomUUID()}`)

      router.push("/company/dashboard")
    } catch {
      setServerError("Network error. Please try again.")
      setLoading(false)
    }
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
            <CardTitle className="text-2xl font-bold">Company Login</CardTitle>
            <CardDescription>
              Sign in with the email and password you set during registration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {info && (
                  <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
                    {info}
                  </div>
                )}
                {serverError && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    {serverError}
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/forgot-password?type=company"
                          className="text-xs text-primary hover:underline"
                        >
                          Forgot password?
                        </Link>
                      </div>
                      <FormControl>
                        <PasswordInput
                          placeholder="Enter password"
                          autoComplete="current-password"
                          disabled={loading}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/register/company" className="text-primary hover:underline">
                    Register Company
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
