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
import type { CandidateFormData } from "../registration-wizard"

const nationalities = [
  "Indian", "Pakistani", "Filipino", "Bangladeshi", "Nepali", "Sri Lankan",
  "Egyptian", "Jordanian", "Lebanese", "Syrian", "Moroccan", "Tunisian",
  "Nigerian", "Kenyan", "Ugandan", "Ethiopian", "South African",
  "British", "American", "Canadian", "Australian", "Other"
]

const genders = ["Male", "Female", "Prefer not to say"]

interface PersonalInfoStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function PersonalInfoStep({ formData, updateFormData }: PersonalInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide your basic details
        </p>
      </div>

      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => updateFormData({ fullName: e.target.value })}
          required
        />
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          placeholder="your@email.com"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          required
        />
      </div>

      {/* WhatsApp */}
      <div className="space-y-2">
        <Label htmlFor="whatsapp">WhatsApp Number *</Label>
        <Input
          id="whatsapp"
          type="tel"
          placeholder="+971 50 123 4567"
          value={formData.whatsapp}
          onChange={(e) => updateFormData({ whatsapp: e.target.value, phone: e.target.value })}
          required
        />
        <p className="text-xs text-muted-foreground">
          Include country code (e.g., +971 for UAE)
        </p>
      </div>

      {/* Gender & Nationality */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              {genders.map((gender) => (
                <SelectItem key={gender} value={gender.toLowerCase()}>
                  {gender}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Nationality *</Label>
          <Select
            value={formData.nationality}
            onValueChange={(value) => updateFormData({ nationality: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select nationality" />
            </SelectTrigger>
            <SelectContent>
              {nationalities.map((nat) => (
                <SelectItem key={nat} value={nat.toLowerCase()}>
                  {nat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
