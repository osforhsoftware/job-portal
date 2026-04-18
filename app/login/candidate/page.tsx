"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, ArrowRight, Briefcase, Loader2 } from "lucide-react"
import {
  emailPasswordLoginSchema,
  type EmailPasswordLoginValues,
} from "@/lib/validation/email-password-login"

export default function CandidateLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirect") || "/candidate/dashboard"
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState("")

  const form = useForm<EmailPasswordLoginValues>({
    resolver: zodResolver(emailPasswordLoginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  })

  const onSubmit = async (values: EmailPasswordLoginValues) => {
    setServerError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email, password: values.password, loginType: "candidate" }),
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || "Login failed")
        setLoading(false)
        return
      }

      if (data.user.role !== "candidate") {
        setServerError(
          "This login is only for candidate accounts. Please use the correct portal for your role.",
        )
        setLoading(false)
        return
      }

      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("token", `candidate_token_${crypto.randomUUID()}`)

      router.push(redirectTo.startsWith("/") ? redirectTo : "/candidate/dashboard")
    } catch {
      setServerError("Network error. Please try again.")
      setLoading(false)
    }
  }

  const handleSendOtp = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setOtpSent(true)
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1500))
    setLoading(false)
    router.push("/candidate/profile")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="site-container flex flex-1 items-center justify-center bg-background py-12">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Briefcase className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>
                Login to your candidate account
              </CardDescription>
            </CardHeader>
            <CardContent>
              {serverError && loginMethod === "email" && (
                <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </p>
              )}
              <Tabs defaultValue="email" onValueChange={(v) => setLoginMethod(v as "email" | "phone")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="email" className="gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="phone" className="gap-2">
                    <Phone className="h-4 w-4" />
                    Phone/WhatsApp
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="email" className="mt-6 space-y-4">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="your@email.com"
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
                                href="/forgot-password?type=candidate"
                                className="text-xs text-primary hover:underline"
                              >
                                Forgot password?
                              </Link>
                            </div>
                            <FormControl>
                              <PasswordInput
                                placeholder="••••••••"
                                autoComplete="current-password"
                                disabled={loading}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={loading}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                  <p className="text-center text-xs text-muted-foreground">
                    Registered via an agency? Use the email you signed up with. If you don’t have a password yet,
                    contact your agency or use the link below to set one.
                  </p>
                </TabsContent>

                <TabsContent value="phone" className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (WhatsApp)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  {otpSent && loginMethod === "phone" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone-otp">Enter OTP</Label>
                      <Input
                        id="phone-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        OTP sent via WhatsApp to {phone}
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                {loginMethod === "phone" && (
                  <>
                    {!otpSent ? (
                      <Button
                        className="w-full gap-2"
                        onClick={handleSendOtp}
                        disabled={loading || !phone}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Send OTP
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        className="w-full gap-2"
                        onClick={handleVerifyOtp}
                        disabled={loading || otp.length !== 6}
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            Verify & Login
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    )}
                    {otpSent && (
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                          setOtpSent(false)
                          setOtp("")
                        }}
                      >
                        Change Phone
                      </Button>
                    )}
                  </>
                )}
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register/candidate" className="font-medium text-primary hover:underline">
                  Create Profile
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
