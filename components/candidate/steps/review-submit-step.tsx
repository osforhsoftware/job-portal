"use client"

import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Video,
  Check,
  X,
  AlertCircle,
} from "lucide-react"
import type { CandidateFormData } from "../registration-wizard"

interface ReviewSubmitStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function ReviewSubmitStep({ formData, updateFormData }: ReviewSubmitStepProps) {
  const hasVideo = formData.videoFile !== null
  const hasCV = formData.cvFile !== null
  const hasPhoto = formData.photoFile !== null

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Review & Submit</h2>
        <p className="text-sm text-muted-foreground">
          Review your profile information before submitting
        </p>
      </div>

      {/* Profile Completeness */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-xl font-bold">85%</span>
            </div>
            <div>
              <p className="font-medium text-foreground">Profile Completeness</p>
              <p className="text-sm text-muted-foreground">
                Add a video profile to reach 100%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Info Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-5 w-5 text-primary" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Name:</span>
              <span className="ml-2 font-medium text-foreground">
                {formData.firstName} {formData.lastName || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 font-medium text-foreground">
                {formData.email || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Phone:</span>
              <span className="ml-2 font-medium text-foreground">
                {formData.phone || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Nationality:</span>
              <span className="ml-2 font-medium capitalize text-foreground">
                {formData.nationality || "—"}
              </span>
            </div>
          </div>
          {formData.languages && formData.languages.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Languages:</span>
              {formData.languages.map((lang) => (
                <Badge key={lang} variant="secondary" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-5 w-5 text-primary" />
            Work Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Experience:</span>
              <span className="ml-2 font-medium capitalize text-foreground">
                {formData.totalExperience || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Notice Period:</span>
              <span className="ml-2 font-medium capitalize text-foreground">
                {formData.noticePeriod || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Current Role:</span>
              <span className="ml-2 font-medium text-foreground">
                {formData.currentJobTitle || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Expected Salary:</span>
              <span className="ml-2 font-medium text-foreground">
                {formData.expectedSalary || "—"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education & Skills Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-5 w-5 text-primary" />
            Education & Skills
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-muted-foreground">Education:</span>
              <span className="ml-2 font-medium capitalize text-foreground">
                {formData.highestEducation || "—"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Field:</span>
              <span className="ml-2 font-medium capitalize text-foreground">
                {formData.fieldOfStudy || "—"}
              </span>
            </div>
          </div>
          {formData.skills && formData.skills.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-muted-foreground">Skills:</span>
              {formData.skills.slice(0, 8).map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
              {formData.skills.length > 8 && (
                <Badge variant="outline" className="text-xs">
                  +{formData.skills.length - 8} more
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-5 w-5 text-primary" />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              {hasCV ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              <span className={hasCV ? "text-foreground" : "text-muted-foreground"}>
                CV/Resume
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasPhoto ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <X className="h-5 w-5 text-destructive" />
              )}
              <span className={hasPhoto ? "text-foreground" : "text-muted-foreground"}>
                Photo
              </span>
            </div>
            <div className="flex items-center gap-2">
              {hasVideo ? (
                <Check className="h-5 w-5 text-success" />
              ) : (
                <AlertCircle className="h-5 w-5 text-warning" />
              )}
              <span className={hasVideo ? "text-foreground" : "text-muted-foreground"}>
                Video Profile {!hasVideo && "(Optional)"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <div className="space-y-4 rounded-lg border border-border p-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="terms"
            checked={formData.acceptTerms}
            onCheckedChange={(checked) =>
              updateFormData({ acceptTerms: checked as boolean })
            }
          />
          <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
            I agree to the{" "}
            <a href="/terms" className="text-primary hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </a>
            . I confirm that all information provided is accurate. *
          </label>
        </div>

        <div className="flex items-start space-x-3">
          <Checkbox
            id="serviceCharge"
            checked={formData.acceptServiceCharge}
            onCheckedChange={(checked) =>
              updateFormData({ acceptServiceCharge: checked as boolean })
            }
          />
          <label htmlFor="serviceCharge" className="text-sm text-foreground cursor-pointer">
            I understand and accept that a service charge may apply when my profile is
            posted to employers and upon successful placement. The fee structure will
            be transparently communicated before any charges apply. *
          </label>
        </div>
      </div>

      {/* Final Note */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>What happens next?</strong> After submitting, your profile will be
          reviewed and made visible to employers. You will receive notifications when
          companies show interest or place bids on your profile.
        </p>
      </div>
    </div>
  )
}
