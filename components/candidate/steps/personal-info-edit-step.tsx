"use client"

import { useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { PasswordInput } from "@/components/ui/password-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2, UserRound, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { CandidateFormData } from "../registration-wizard"

const nationalities = [
  "Indian", "Pakistani", "Filipino", "Bangladeshi", "Nepali", "Sri Lankan",
  "Egyptian", "Jordanian", "Lebanese", "Syrian", "Moroccan", "Tunisian",
  "Nigerian", "Kenyan", "Ugandan", "Ethiopian", "South African",
  "British", "American", "Canadian", "Australian", "Other"
]

const genders = ["Male", "Female", "Prefer not to say"]

const maritalStatuses = ["Single", "Married", "Divorced", "Widowed", "Prefer not to say"]

const commonLanguages = [
  "English", "Arabic", "Hindi", "Urdu", "Tagalog", "Bengali", "Tamil",
  "Malayalam", "Nepali", "French", "Spanish", "Mandarin", "Other",
]

interface PersonalInfoEditStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

/** Profile edit flow (local state); registration uses `PersonalInfoStep` with react-hook-form. */
export function PersonalInfoEditStep({ formData, updateFormData }: PersonalInfoEditStepProps) {
  const { toast } = useToast()
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoUploading, setPhotoUploading] = useState(false)

  const removeLanguage = (lang: string) => {
    updateFormData({ languages: (formData.languages || []).filter((l) => l !== lang) })
  }

  const languagesToAdd = commonLanguages.filter((l) => !(formData.languages || []).includes(l))

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Profile photo must be 2MB or less.", variant: "destructive" })
      return
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please choose an image file.", variant: "destructive" })
      return
    }
    setPhotoUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      fd.append("type", "photo")
      const res = await fetch("/api/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Upload failed")
      }
      updateFormData({ photoUrl: data.url })
      toast({ title: "Photo uploaded", description: "Remember to save your profile to keep changes." })
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
    } finally {
      setPhotoUploading(false)
      if (photoInputRef.current) photoInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Personal Information</h2>
        <p className="text-sm text-muted-foreground">
          Please provide your basic details
        </p>
      </div>

      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Optional</h3>
          <p className="text-xs text-muted-foreground">Languages and profile photo help employers understand you better.</p>
        </div>

        <div className="space-y-3">
          <Label>Languages</Label>
          {formData.languages && formData.languages.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="gap-1 py-1">
                  {lang}
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang)}
                    className="ml-1 rounded-full hover:bg-muted"
                    aria-label={`Remove ${lang}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          ) : null}
          {languagesToAdd.length > 0 ? (
            <Select
              key={(formData.languages || []).join("|")}
              onValueChange={(lang) => {
                if (!(formData.languages || []).includes(lang)) {
                  updateFormData({ languages: [...(formData.languages || []), lang] })
                }
              }}
            >
              <SelectTrigger className="w-full sm:max-w-md">
                <SelectValue placeholder="Add a language" />
              </SelectTrigger>
              <SelectContent>
                {languagesToAdd.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-xs text-muted-foreground">
              All preset languages are added. Remove one above to pick another.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Profile photo</Label>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {formData.photoUrl ? (
                <img src={formData.photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <UserRound className="h-9 w-9 text-muted-foreground" />
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={photoUploading}
                onClick={() => photoInputRef.current?.click()}
              >
                {photoUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading…
                  </>
                ) : formData.photoUrl ? (
                  "Change photo"
                ) : (
                  "Upload photo"
                )}
              </Button>
              {formData.photoUrl ? (
                <Button type="button" variant="ghost" size="sm" onClick={() => updateFormData({ photoUrl: "" })}>
                  Remove
                </Button>
              ) : null}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">JPG or PNG, max 2MB.</p>
        </div>
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
          placeholder="Enter your email address"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          required
        />
      </div>

      {/* Password */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="password">Password *</Label>
          <PasswordInput
            id="password"
            placeholder="Create a password (min 6 characters)"
            value={formData.password}
            onChange={(e) => updateFormData({ password: e.target.value })}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="Re-enter password"
            value={formData.confirmPassword}
            onChange={(e) => updateFormData({ confirmPassword: e.target.value })}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
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

      {/* Date of Birth */}
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData({ dateOfBirth: e.target.value })}
        />
      </div>

      {/* Marital Status */}
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

      {/* Current Location */}
      <div className="space-y-2">
        <Label htmlFor="currentLocation">Current Location</Label>
        <Input
          id="currentLocation"
          placeholder="e.g. Dubai, UAE"
          value={formData.currentLocation}
          onChange={(e) => updateFormData({ currentLocation: e.target.value })}
        />
      </div>

      {/* Preferred Locations */}
      <div className="space-y-2">
        <Label htmlFor="preferredLocations">Preferred job locations</Label>
        <Input
          id="preferredLocations"
          placeholder="e.g. Dubai, Abu Dhabi, Sharjah (comma-separated)"
          value={(formData.preferredLocations || []).join(", ")}
          onChange={(e) =>
            updateFormData({
              preferredLocations: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
        />
      </div>
    </div>
  )
}
