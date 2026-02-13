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
import type { CandidateFormData } from "../registration-wizard"

const nationalities = [
  "Indian", "Pakistani", "Filipino", "Bangladeshi", "Nepali", "Sri Lankan",
  "Egyptian", "Jordanian", "Lebanese", "Syrian", "Moroccan", "Tunisian",
  "Nigerian", "Kenyan", "Ugandan", "Ethiopian", "South African",
  "British", "American", "Canadian", "Australian", "Other"
]

const locations = [
  "Dubai, UAE", "Abu Dhabi, UAE", "Sharjah, UAE", "Ajman, UAE",
  "Riyadh, Saudi Arabia", "Jeddah, Saudi Arabia", "Dammam, Saudi Arabia",
  "Doha, Qatar", "Kuwait City, Kuwait", "Manama, Bahrain", "Muscat, Oman",
  "Remote / Any Location"
]

const languages = [
  "English", "Arabic", "Hindi", "Urdu", "Filipino/Tagalog", "Bengali",
  "Malayalam", "Tamil", "Telugu", "Kannada", "French", "Spanish",
  "Portuguese", "Chinese", "Japanese", "Korean", "Other"
]

const genders = ["Male", "Female", "Prefer not to say"]
const maritalStatuses = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]

interface PersonalInfoStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function PersonalInfoStep({ formData, updateFormData }: PersonalInfoStepProps) {
  const handleLanguageToggle = (language: string) => {
    const current = formData.languages || []
    if (current.includes(language)) {
      updateFormData({ languages: current.filter((l) => l !== language) })
    } else {
      updateFormData({ languages: [...current, language] })
    }
  }

  const handleLocationToggle = (location: string) => {
    const current = formData.preferredLocations || []
    if (current.includes(location)) {
      updateFormData({ preferredLocations: current.filter((l) => l !== location) })
    } else {
      updateFormData({ preferredLocations: [...current, location] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Basic details about yourself
        </p>
      </div>

      {/* Name Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => updateFormData({ firstName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => updateFormData({ lastName: e.target.value })}
          />
        </div>
      </div>

      {/* Contact Row */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone / WhatsApp *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+971 50 123 4567"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
          />
        </div>
      </div>

      {/* Demographics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="dob">Date of Birth *</Label>
          <Input
            id="dob"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Gender *</Label>
          <Select
            value={formData.gender}
            onValueChange={(value) => updateFormData({ gender: value })}
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
          <Label>Marital Status</Label>
          <Select
            value={formData.maritalStatus}
            onValueChange={(value) => updateFormData({ maritalStatus: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {maritalStatuses.map((status) => (
                <SelectItem key={status} value={status.toLowerCase()}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Nationality & Location */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Nationality *</Label>
          <Select
            value={formData.nationality}
            onValueChange={(value) => updateFormData({ nationality: value })}
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
        <div className="space-y-2">
          <Label>Current Location *</Label>
          <Select
            value={formData.currentLocation}
            onValueChange={(value) => updateFormData({ currentLocation: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select current location" />
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

      {/* Preferred Locations */}
      <div className="space-y-3">
        <Label>Preferred Work Locations (Select all that apply)</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {locations.map((location) => (
            <div key={location} className="flex items-center space-x-2">
              <Checkbox
                id={`loc-${location}`}
                checked={formData.preferredLocations?.includes(location)}
                onCheckedChange={() => handleLocationToggle(location)}
              />
              <label
                htmlFor={`loc-${location}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {location.split(",")[0]}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div className="space-y-3">
        <Label>Languages Known (Select all that apply) *</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {languages.map((language) => (
            <div key={language} className="flex items-center space-x-2">
              <Checkbox
                id={`lang-${language}`}
                checked={formData.languages?.includes(language)}
                onCheckedChange={() => handleLanguageToggle(language)}
              />
              <label
                htmlFor={`lang-${language}`}
                className="text-sm text-foreground cursor-pointer"
              >
                {language}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
