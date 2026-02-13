"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, ArrowRight, Loader2, Upload, Check } from "lucide-react"

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

export default function CompanyRegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    companyName: "",
    tradeLicense: "",
    industry: "",
    companySize: "",
    website: "",
    country: "",
    city: "",
    address: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactPosition: "",
    logoFile: null as File | null,
    acceptTerms: false,
  })

  const updateForm = (field: string, value: string | boolean | File | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    router.push("/company/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="border-border shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <Building2 className="h-7 w-7 text-primary" />
              </div>
              <CardTitle className="text-2xl">Register Your Company</CardTitle>
              <CardDescription>
                {step === 1 ? "Company Information" : "Contact Details"}
              </CardDescription>
              {/* Step Indicator */}
              <div className="mt-4 flex justify-center gap-2">
                <div className={`h-2 w-16 rounded-full ${step >= 1 ? "bg-primary" : "bg-muted"}`} />
                <div className={`h-2 w-16 rounded-full ${step >= 2 ? "bg-primary" : "bg-muted"}`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === 1 ? (
                <>
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name *</Label>
                    <Input
                      id="companyName"
                      placeholder="Enter company name"
                      value={formData.companyName}
                      onChange={(e) => updateForm("companyName", e.target.value)}
                    />
                  </div>

                  {/* Trade License */}
                  <div className="space-y-2">
                    <Label htmlFor="tradeLicense">Trade License Number *</Label>
                    <Input
                      id="tradeLicense"
                      placeholder="Enter trade license number"
                      value={formData.tradeLicense}
                      onChange={(e) => updateForm("tradeLicense", e.target.value)}
                    />
                  </div>

                  {/* Industry & Size */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Industry *</Label>
                      <Select
                        value={formData.industry}
                        onValueChange={(value) => updateForm("industry", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                        <SelectContent>
                          {industries.map((ind) => (
                            <SelectItem key={ind} value={ind.toLowerCase()}>
                              {ind}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Company Size *</Label>
                      <Select
                        value={formData.companySize}
                        onValueChange={(value) => updateForm("companySize", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent>
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size.toLowerCase()}>
                              {size}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Country & City */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Country *</Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => updateForm("country", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country} value={country.toLowerCase()}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="Enter city"
                        value={formData.city}
                        onChange={(e) => updateForm("city", e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      placeholder="https://www.company.com"
                      value={formData.website}
                      onChange={(e) => updateForm("website", e.target.value)}
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Company Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Brief description of your company..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) => updateForm("description", e.target.value)}
                    />
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <Label>Company Logo (Optional)</Label>
                    <div className="flex items-center gap-4">
                      <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted hover:border-primary">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => updateForm("logoFile", e.target.files?.[0] || null)}
                        />
                        {formData.logoFile ? (
                          <Check className="h-6 w-6 text-success" />
                        ) : (
                          <Upload className="h-6 w-6 text-muted-foreground" />
                        )}
                      </label>
                      <div className="text-sm text-muted-foreground">
                        {formData.logoFile ? formData.logoFile.name : "PNG, JPG up to 2MB"}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full gap-2" onClick={() => setStep(2)}>
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  {/* Contact Name */}
                  <div className="space-y-2">
                    <Label htmlFor="contactName">Contact Person Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Full name"
                      value={formData.contactName}
                      onChange={(e) => updateForm("contactName", e.target.value)}
                    />
                  </div>

                  {/* Contact Position */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPosition">Position/Title *</Label>
                    <Input
                      id="contactPosition"
                      placeholder="e.g., HR Manager"
                      value={formData.contactPosition}
                      onChange={(e) => updateForm("contactPosition", e.target.value)}
                    />
                  </div>

                  {/* Contact Email */}
                  <div className="space-y-2">
                    <Label htmlFor="contactEmail">Email Address *</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      placeholder="contact@company.com"
                      value={formData.contactEmail}
                      onChange={(e) => updateForm("contactEmail", e.target.value)}
                    />
                  </div>

                  {/* Contact Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Phone / WhatsApp *</Label>
                    <Input
                      id="contactPhone"
                      type="tel"
                      placeholder="+971 50 123 4567"
                      value={formData.contactPhone}
                      onChange={(e) => updateForm("contactPhone", e.target.value)}
                    />
                  </div>

                  {/* Terms */}
                  <div className="flex items-start space-x-3 rounded-lg border border-border p-4">
                    <Checkbox
                      id="terms"
                      checked={formData.acceptTerms}
                      onCheckedChange={(checked) => updateForm("acceptTerms", checked as boolean)}
                    />
                    <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                      I agree to the{" "}
                      <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
                      {" "}and{" "}
                      <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>.
                      I confirm that I am authorized to register this company.
                    </label>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button
                      className="flex-1 gap-2"
                      onClick={handleSubmit}
                      disabled={loading || !formData.acceptTerms}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          Register Company
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <a href="/login/company" className="font-medium text-primary hover:underline">
                  Login
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
