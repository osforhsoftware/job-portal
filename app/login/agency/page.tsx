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

const ERROR_MESSAGES: Record<string, string> = {
  rejected: "Your agency has been rejected. You cannot sign in. Please contact your agency or support.",
  inactive: "Your agency account is inactive. You cannot sign in. Please contact your agency or support.",
  pending: "Your agency is pending admin approval. You cannot sign in until the agency is approved.",
  session: "Your session is no longer valid. Please sign in again.",
}

export default function AgencyLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm<EmailPasswordLoginValues>({
    resolver: zodResolver(emailPasswordLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  useEffect(() => {
    const errorCode = searchParams.get("error")
    if (errorCode && ERROR_MESSAGES[errorCode]) {
      setServerError(ERROR_MESSAGES[errorCode])
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

      if (data.user.role !== "agency" && data.user.role !== "agent") {
        setServerError("Invalid account type")
        setLoading(false)
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", `agency_token_${crypto.randomUUID()}`)

      if (data.user.role === "agent") {
        router.push("/agent/dashboard")
      } else {
        router.push("/agency/dashboard")
      }
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
            <CardTitle className="text-2xl font-bold">Agency / Agent Login</CardTitle>
            <CardDescription>
              Sign in to your agency or agent account
            </CardDescription>
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <Link
                          href="/forgot-password?type=agency"
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
                  <Link href="/register/agency" className="text-primary hover:underline">
                    Register here
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
