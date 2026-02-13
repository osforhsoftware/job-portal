"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import type { CandidateFormData } from "../registration-wizard"

const experienceYears = [
  "Fresher (0-1 years)",
  "1-2 years",
  "2-3 years",
  "3-5 years",
  "5-7 years",
  "7-10 years",
  "10-15 years",
  "15+ years"
]

const noticePeriods = [
  "Immediate",
  "1 Week",
  "2 Weeks",
  "1 Month",
  "2 Months",
  "3 Months",
  "Currently Serving Notice"
]

const industries = [
  "Construction", "Healthcare", "Hospitality", "IT & Technology",
  "Manufacturing", "Retail", "Finance & Banking", "Education",
  "Transportation & Logistics", "Oil & Gas", "Real Estate",
  "Telecommunications", "Government", "Engineering", "Other"
]

const jobTypes = [
  "Full-time", "Part-time", "Contract", "Temporary",
  "Freelance", "Internship"
]

const salaryRanges = [
  "Below $500", "$500 - $1,000", "$1,000 - $1,500", "$1,500 - $2,000",
  "$2,000 - $3,000", "$3,000 - $4,000", "$4,000 - $5,000",
  "$5,000 - $7,500", "$7,500 - $10,000", "$10,000+"
]

interface WorkExperienceStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function WorkExperienceStep({ formData, updateFormData }: WorkExperienceStepProps) {
  const handleIndustryToggle = (industry: string) => {
    const current = formData.industries || []
    if (current.includes(industry)) {
      updateFormData({ industries: current.filter((i) => i !== industry) })
    } else {
      updateFormData({ industries: [...current, industry] })
    }
  }

  const handleJobTypeToggle = (jobType: string) => {
    const current = formData.jobTypes || []
    if (current.includes(jobType)) {
      updateFormData({ jobTypes: current.filter((j) => j !== jobType) })
    } else {
      updateFormData({ jobTypes: [...current, jobType] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Work Experience</h2>
        <p className="text-sm text-muted-foreground">
          Tell us about your professional background
        </p>
      </div>

      {/* Experience & Notice */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Total Experience *</Label>
          <Select
            value={formData.totalExperience}
            onValueChange={(value) => updateFormData({ totalExperience: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select experience" />
            </SelectTrigger>
            <SelectContent>
              {experienceYears.map((exp) => (
                <SelectItem key={exp} value={exp.toLowerCase()}>
                  {exp}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Notice Period *</Label>
          <Select
            value={formData.noticePeriod}
            onValueChange={(value) => updateFormData({ noticePeriod: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select notice period" />
            </SelectTrigger>
            <SelectContent>
              {noticePeriods.map((period) => (
                <SelectItem key={period} value={period.toLowerCase()}>
                  {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current Position */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jobTitle">Current/Last Job Title</Label>
          <Input
            id="jobTitle"
            placeholder="e.g., Senior Software Engineer"
            value={formData.currentJobTitle}
            onChange={(e) => updateFormData({ currentJobTitle: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Current/Last Company</Label>
          <Input
            id="company"
            placeholder="Company name"
            value={formData.currentCompany}
            onChange={(e) => updateFormData({ currentCompany: e.target.value })}
          />
        </div>
      </div>

      {/* Salary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Current Salary (Monthly)</Label>
          <Select
            value={formData.currentSalary}
            onValueChange={(value) => updateFormData({ currentSalary: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select current salary" />
            </SelectTrigger>
            <SelectContent>
              {salaryRanges.map((range) => (
                <SelectItem key={range} value={range.toLowerCase()}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Expected Salary (Monthly) *</Label>
          <Select
            value={formData.expectedSalary}
            onValueChange={(value) => updateFormData({ expectedSalary: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select expected salary" />
            </SelectTrigger>
            <SelectContent>
              {salaryRanges.map((range) => (
                <SelectItem key={range} value={range.toLowerCase()}>
                  {range}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Preferred Industries */}
      <div className="space-y-3">
        <Label>Preferred Industries (Select all that apply) *</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {industries.map((industry) => (
            <div key={industry} className="flex items-center space-x-2">
              <Checkbox
                id={`ind-${industry}`}
                checked={formData.industries?.includes(industry)}
                onCheckedChange={() => handleIndustryToggle(industry)}
              />
              <label
                htmlFor={`ind-${industry}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {industry}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Job Types */}
      <div className="space-y-3">
        <Label>Preferred Job Types (Select all that apply) *</Label>
        <div className="flex flex-wrap gap-4">
          {jobTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={`job-${type}`}
                checked={formData.jobTypes?.includes(type)}
                onCheckedChange={() => handleJobTypeToggle(type)}
              />
              <label
                htmlFor={`job-${type}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {type}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
