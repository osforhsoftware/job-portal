"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Plus,
  X,
  Loader2,
  Check,
} from "lucide-react"

const jobCategories = [
  "Engineering", "Healthcare", "Construction", "Hospitality",
  "IT & Technology", "Manufacturing", "Logistics", "Finance", "Other"
]

const experienceLevels = [
  "Fresher", "1-2 years", "2-3 years", "3-5 years",
  "5-7 years", "7-10 years", "10+ years"
]

const educationLevels = [
  "High School", "Diploma", "Bachelor's", "Master's", "PhD", "Any"
]

const jobTypes = ["Full-time", "Part-time", "Contract", "Temporary"]

const locations = [
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE",
  "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia",
  "Doha, Qatar", "Kuwait City, Kuwait", "Manama, Bahrain"
]

const benefits = [
  "Accommodation", "Transportation", "Health Insurance",
  "Annual Leave", "Flight Tickets", "Food Allowance",
  "Overtime Pay", "End of Service", "Training"
]

const commonSkills = [
  "Communication", "Leadership", "Project Management",
  "Microsoft Office", "Problem Solving", "Teamwork",
  "Time Management", "Technical Skills", "Safety Compliance"
]

export default function NewJobPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [customSkill, setCustomSkill] = useState("")
  
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    jobType: "full-time",
    location: "",
    positions: "1",
    experience: "",
    education: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    skills: [] as string[],
    benefits: [] as string[],
    deadline: "",
    acceptBidding: false,
    acceptServiceCharge: false,
  })

  const updateForm = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSkill = (skill: string) => {
    const current = formData.skills
    if (current.includes(skill)) {
      updateForm("skills", current.filter((s) => s !== skill))
    } else {
      updateForm("skills", [...current, skill])
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills.includes(customSkill.trim())) {
      updateForm("skills", [...formData.skills, customSkill.trim()])
      setCustomSkill("")
    }
  }

  const toggleBenefit = (benefit: string) => {
    const current = formData.benefits
    if (current.includes(benefit)) {
      updateForm("benefits", current.filter((b) => b !== benefit))
    } else {
      updateForm("benefits", [...current, benefit])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setLoading(false)
    router.push("/company/jobs")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/company/dashboard">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Post New Job</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-3xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                s <= step ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Senior Civil Engineer"
                  value={formData.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateForm("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCategories.map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location *</Label>
                  <Select
                    value={formData.location}
                    onValueChange={(value) => updateForm("location", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc.toLowerCase()}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Job Type *</Label>
                <RadioGroup
                  value={formData.jobType}
                  onValueChange={(value) => updateForm("jobType", value)}
                  className="flex flex-wrap gap-4"
                >
                  {jobTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.toLowerCase()} id={type} />
                      <Label htmlFor={type} className="cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="positions">No. of Positions *</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions}
                    onChange={(e) => updateForm("positions", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Min Experience *</Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => updateForm("experience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((exp) => (
                        <SelectItem key={exp} value={exp.toLowerCase()}>
                          {exp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Education *</Label>
                  <Select
                    value={formData.education}
                    onValueChange={(value) => updateForm("education", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {educationLevels.map((edu) => (
                        <SelectItem key={edu} value={edu.toLowerCase()}>
                          {edu}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="salaryMin">Salary Range (Monthly) *</Label>
                  <Input
                    id="salaryMin"
                    placeholder="Min e.g., 3000"
                    value={formData.salaryMin}
                    onChange={(e) => updateForm("salaryMin", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salaryMax">&nbsp;</Label>
                  <Input
                    id="salaryMax"
                    placeholder="Max e.g., 5000"
                    value={formData.salaryMax}
                    onChange={(e) => updateForm("salaryMax", e.target.value)}
                  />
                </div>
              </div>

              <Button className="w-full gap-2" onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Description & Skills */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Job Description & Requirements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Job Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what the candidate will be doing..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  placeholder="List the qualifications, certifications, and experience required..."
                  rows={4}
                  value={formData.requirements}
                  onChange={(e) => updateForm("requirements", e.target.value)}
                />
              </div>

              {/* Selected Skills */}
              {formData.skills.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Skills</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="gap-1 py-1">
                        {skill}
                        <button onClick={() => toggleSkill(skill)}>
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Label>Required Skills (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {commonSkills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={formData.skills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <label htmlFor={`skill-${skill}`} className="text-sm cursor-pointer">
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomSkill())}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={addCustomSkill}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button className="flex-1 gap-2" onClick={() => setStep(3)}>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Benefits & Submit */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Benefits & Confirmation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Benefits Offered (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center space-x-2">
                      <Checkbox
                        id={`benefit-${benefit}`}
                        checked={formData.benefits.includes(benefit)}
                        onCheckedChange={() => toggleBenefit(benefit)}
                      />
                      <label htmlFor={`benefit-${benefit}`} className="text-sm cursor-pointer">
                        {benefit}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => updateForm("deadline", e.target.value)}
                />
              </div>

              <div className="space-y-4 rounded-lg border border-border p-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="bidding"
                    checked={formData.acceptBidding}
                    onCheckedChange={(checked) => updateForm("acceptBidding", checked as boolean)}
                  />
                  <label htmlFor="bidding" className="text-sm cursor-pointer">
                    <span className="font-medium">Enable Bidding</span>
                    <p className="text-muted-foreground">
                      Allow agencies to bid on candidates for this position. You can review bids and select the best candidates.
                    </p>
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="serviceCharge"
                    checked={formData.acceptServiceCharge}
                    onCheckedChange={(checked) => updateForm("acceptServiceCharge", checked as boolean)}
                  />
                  <label htmlFor="serviceCharge" className="text-sm cursor-pointer">
                    <span className="font-medium">Accept Service Charges *</span>
                    <p className="text-muted-foreground">
                      I understand that a service charge applies upon successful placement. Fee structure will be communicated before any charges.
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  className="flex-1 gap-2"
                  onClick={handleSubmit}
                  disabled={loading || !formData.acceptServiceCharge}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Post Job
                      <Check className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
