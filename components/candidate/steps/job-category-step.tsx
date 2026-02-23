"use client"

import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { JobCategorySelector } from "../job-category-selector"
import type { CandidateFormData } from "../registration-wizard"

const visaCategories = [
  "Visit Visa",
  "Employment Visa",
  "Family Visa",
  "Student Visa",
  "Investor Visa",
  "No Visa Required",
  "Other",
]

interface JobCategoryStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function JobCategoryStep({ formData, updateFormData }: JobCategoryStepProps) {
  const handleSalaryRangeChange = (values: number[]) => {
    updateFormData({
      salaryRange: { min: values[0], max: values[1] },
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Job Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Select your job categories and salary expectations
        </p>
      </div>

      {/* Job Categories */}
      <JobCategorySelector
        selectedCategories={formData.jobCategories || []}
        onSelectionChange={(categories) => updateFormData({ jobCategories: categories })}
        required
      />

      {/* Salary Range Slider */}
      <div className="space-y-4">
        <div>
          <Label className="text-base font-semibold">Expected Salary Range (Monthly) *</Label>
          <p className="text-sm text-muted-foreground mt-1">
            Drag the sliders to set your minimum and maximum expected salary
          </p>
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Minimum</span>
              <span className="font-medium">
                ${formData.salaryRange?.min || 500} / month
              </span>
            </div>
            <Slider
              value={[formData.salaryRange?.min || 500]}
              onValueChange={(values) =>
                handleSalaryRangeChange([values[0], formData.salaryRange?.max || 5000])
              }
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Maximum</span>
              <span className="font-medium">
                ${formData.salaryRange?.max || 5000} / month
              </span>
            </div>
            <Slider
              value={[formData.salaryRange?.max || 5000]}
              onValueChange={(values) =>
                handleSalaryRangeChange([formData.salaryRange?.min || 500, values[0]])
              }
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          {formData.salaryRange && (
            <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
              <p className="text-sm font-medium text-foreground">
                Salary Range: ${formData.salaryRange.min.toLocaleString()} - ${formData.salaryRange.max.toLocaleString()} / month
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Visa Category */}
      <div className="space-y-2">
        <Label>Visa Category *</Label>
        <Select
          value={formData.visaCategory}
          onValueChange={(value) => updateFormData({ visaCategory: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select your visa category" />
          </SelectTrigger>
          <SelectContent>
            {visaCategories.map((visa) => (
              <SelectItem key={visa} value={visa.toLowerCase().replace(/\s+/g, '_')}>
                {visa}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          This helps employers understand your work authorization status
        </p>
      </div>
    </div>
  )
}
