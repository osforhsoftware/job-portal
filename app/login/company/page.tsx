"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, ArrowRight, Building2, Loader2 } from "lucide-react"

export default function CompanyLoginPage() {
  const router = useRouter()
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)

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
    router.push("/company/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Company Login</CardTitle>
              <CardDescription>
                Access your company dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
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
                  <div className="space-y-2">
                    <Label htmlFor="email">Company Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="company@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  {otpSent && loginMethod === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="email-otp">Enter OTP</Label>
                      <Input
                        id="email-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground">
                        OTP sent to {email}
                      </p>
                    </div>
                  )}
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
                {!otpSent ? (
                  <Button
                    className="w-full gap-2"
                    onClick={handleSendOtp}
                    disabled={loading || (!email && !phone)}
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
                    Change {loginMethod === "email" ? "Email" : "Phone"}
                  </Button>
                )}
              </div>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                {"Don't have an account? "}
                <Link href="/register/company" className="font-medium text-primary hover:underline">
                  Register Company
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
