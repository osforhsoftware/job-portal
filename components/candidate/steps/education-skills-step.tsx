"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { X, Plus } from "lucide-react"
import type { CandidateFormData } from "../registration-wizard"

const educationLevels = [
  "High School", "Diploma", "Vocational Training",
  "Bachelor's Degree", "Master's Degree", "PhD/Doctorate",
  "Professional Certification", "Other"
]

const fieldsOfStudy = [
  "Computer Science", "Engineering", "Medicine", "Nursing",
  "Business Administration", "Finance", "Accounting", "Marketing",
  "Human Resources", "Law", "Arts & Design", "Hospitality Management",
  "Electrical Engineering", "Mechanical Engineering", "Civil Engineering",
  "Architecture", "Other"
]

const commonSkills = [
  "Microsoft Office", "Communication", "Leadership", "Project Management",
  "Customer Service", "Sales", "Marketing", "Data Analysis",
  "Programming", "Design", "Accounting", "Nursing", "Driving",
  "Plumbing", "Electrical Work", "Carpentry", "Welding",
  "Machine Operation", "Quality Control", "Inventory Management"
]

const commonCertifications = [
  "OSHA Safety", "First Aid/CPR", "PMP", "AWS Certified",
  "Cisco Certified", "CompTIA A+", "CPA", "ACCA",
  "NEBOSH", "ISO 9001", "Six Sigma", "Food Safety (HACCP)",
  "Heavy Equipment License", "Forklift License", "Crane Operator"
]

interface EducationSkillsStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function EducationSkillsStep({ formData, updateFormData }: EducationSkillsStepProps) {
  const [customSkill, setCustomSkill] = useState("")
  const [customCert, setCustomCert] = useState("")

  const handleSkillToggle = (skill: string) => {
    const current = formData.skills || []
    if (current.includes(skill)) {
      updateFormData({ skills: current.filter((s) => s !== skill) })
    } else {
      updateFormData({ skills: [...current, skill] })
    }
  }

  const handleCertToggle = (cert: string) => {
    const current = formData.certifications || []
    if (current.includes(cert)) {
      updateFormData({ certifications: current.filter((c) => c !== cert) })
    } else {
      updateFormData({ certifications: [...current, cert] })
    }
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !formData.skills?.includes(customSkill.trim())) {
      updateFormData({ skills: [...(formData.skills || []), customSkill.trim()] })
      setCustomSkill("")
    }
  }

  const addCustomCert = () => {
    if (customCert.trim() && !formData.certifications?.includes(customCert.trim())) {
      updateFormData({ certifications: [...(formData.certifications || []), customCert.trim()] })
      setCustomCert("")
    }
  }

  const removeSkill = (skill: string) => {
    updateFormData({ skills: formData.skills?.filter((s) => s !== skill) })
  }

  const removeCert = (cert: string) => {
    updateFormData({ certifications: formData.certifications?.filter((c) => c !== cert) })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Education & Skills</h2>
        <p className="text-sm text-muted-foreground">
          Your educational background and key skills
        </p>
      </div>

      {/* Education */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Highest Education *</Label>
          <Select
            value={formData.highestEducation}
            onValueChange={(value) => updateFormData({ highestEducation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((level) => (
                <SelectItem key={level} value={level.toLowerCase()}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Field of Study</Label>
          <Select
            value={formData.fieldOfStudy}
            onValueChange={(value) => updateFormData({ fieldOfStudy: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              {fieldsOfStudy.map((field) => (
                <SelectItem key={field} value={field.toLowerCase()}>
                  {field}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Skills */}
      {formData.skills && formData.skills.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Skills</Label>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <Badge key={skill} variant="secondary" className="gap-1 py-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Skills Selection */}
      <div className="space-y-3">
        <Label>Skills (Select all that apply) *</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {commonSkills.map((skill) => (
            <div key={skill} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${skill}`}
                checked={formData.skills?.includes(skill)}
                onCheckedChange={() => handleSkillToggle(skill)}
              />
              <label
                htmlFor={`skill-${skill}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {skill}
              </label>
            </div>
          ))}
        </div>

        {/* Add Custom Skill */}
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

      {/* Selected Certifications */}
      {formData.certifications && formData.certifications.length > 0 && (
        <div className="space-y-2">
          <Label>Selected Certifications</Label>
          <div className="flex flex-wrap gap-2">
            {formData.certifications.map((cert) => (
              <Badge key={cert} variant="secondary" className="gap-1 py-1">
                {cert}
                <button
                  type="button"
                  onClick={() => removeCert(cert)}
                  className="ml-1 rounded-full hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Certifications Selection */}
      <div className="space-y-3">
        <Label>Certifications (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {commonCertifications.map((cert) => (
            <div key={cert} className="flex items-center space-x-2">
              <Checkbox
                id={`cert-${cert}`}
                checked={formData.certifications?.includes(cert)}
                onCheckedChange={() => handleCertToggle(cert)}
              />
              <label
                htmlFor={`cert-${cert}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {cert}
              </label>
            </div>
          ))}
        </div>

        {/* Add Custom Certification */}
        <div className="flex gap-2">
          <Input
            placeholder="Add custom certification..."
            value={customCert}
            onChange={(e) => setCustomCert(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCert())}
          />
          <Button type="button" variant="outline" size="icon" onClick={addCustomCert}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
