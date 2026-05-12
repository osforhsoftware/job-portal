"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { FormStepper } from "@/components/ui/form-stepper"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  User,
  Briefcase,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  Link2,
  Loader2,
} from "lucide-react"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { JobProfileStep } from "./steps/job-profile-step"
import {
  candidateRegisterSchema,
  type CandidateRegisterFormValues,
} from "./candidate-register-schema"

const steps = [
  {
    id: 1,
    name: "Personal Information",
    subtitle: "Name, contact & account",
    icon: User,
  },
  {
    id: 2,
    name: "Job & Profile",
    subtitle: "Role, experience & documents",
    icon: Briefcase,
  },
] as const

/** @deprecated Use CandidateRegisterFormValues for new registration UI; kept for profile/edit and other flows */
export type CandidateFormData = {
  fullName: string
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  whatsapp: string
  phone: string
  gender: string
  nationality: string
  dateOfBirth: string
  currentLocation: string
  preferredLocations: string[]
  maritalStatus: string
  languages: string[]
  jobCategories: string[]
  totalExperience: string
  noticePeriod: string
  currentJobTitle: string
  currentCompany: string
  currentSalary: string
  expectedSalary: string
  industries: string[]
  jobTypes: string[]
  qualification: string
  highestEducation: string
  fieldOfStudy: string
  skills: string[]
  certifications: string[]
  cvFile: File | null
  videoFile: File | null
  photoFile: File | null
  /** Set when editing profile (server URL after upload or from GET) */
  photoUrl: string
  passportFile: File | null
  salaryRange: { min: number; max: number } | null
  visaCategory: string
  acceptTerms: boolean
  acceptServiceCharge: boolean
}

export function CandidateRegistrationWizard() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [serverError, setServerError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)

  const form = useForm<CandidateRegisterFormValues>({
    resolver: zodResolver(candidateRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      whatsapp: "",
      gender: "",
      nationality: "",
      dateOfBirth: "",
      maritalStatus: "",
      currentLocation: "",
      preferredLocationsInput: "",
      jobCategories: [],
      totalExperience: "",
      qualification: "",
      salaryMin: 500,
      salaryMax: 5000,
      acceptTerms: false,
      cvDocument: "",
    },
    mode: "onSubmit",
  })

  useEffect(() => {
    const ref = searchParams.get("ref")?.trim() || null
    setReferralCode(ref)
  }, [searchParams])

  const acceptTerms = form.watch("acceptTerms")

  const handleNext = async () => {
    setServerError(null)
    const ok = await form.trigger([
      "fullName",
      "email",
      "password",
      "confirmPassword",
      "whatsapp",
      "gender",
      "nationality",
    ])
    if (ok) setCurrentStep(2)
  }

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const onSubmit = async (values: CandidateRegisterFormValues) => {
    setServerError(null)

    if (!cvFile) {
      form.setError("cvDocument", {
        type: "manual",
        message: "Please upload your CV (PDF, max 5MB)",
      })
      return
    }

    try {
      setSubmitting(true)
      const formDataToSend = new FormData()
      const refToSend =
        referralCode ||
        (typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref")
          : null)

      const preferredLocations = values.preferredLocationsInput
        ? values.preferredLocationsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : []

      formDataToSend.append("fullName", values.fullName)
      formDataToSend.append("email", values.email)
      formDataToSend.append("password", values.password)
      formDataToSend.append("whatsapp", values.whatsapp)
      formDataToSend.append("gender", values.gender)
      formDataToSend.append("nationality", values.nationality)
      if (values.dateOfBirth) formDataToSend.append("dateOfBirth", values.dateOfBirth)
      if (values.currentLocation)
        formDataToSend.append("currentLocation", values.currentLocation)
      if (preferredLocations.length)
        formDataToSend.append("preferredLocations", JSON.stringify(preferredLocations))
      if (values.maritalStatus)
        formDataToSend.append("maritalStatus", values.maritalStatus)
      formDataToSend.append("jobCategories", JSON.stringify(values.jobCategories))
      formDataToSend.append("totalExperience", values.totalExperience)
      formDataToSend.append("qualification", values.qualification)
      formDataToSend.append(
        "salaryRange",
        JSON.stringify({ min: values.salaryMin, max: values.salaryMax }),
      )
      formDataToSend.append("acceptTerms", values.acceptTerms.toString())

      if (refToSend) {
        formDataToSend.append("referralLink", refToSend)
      }

      if (cvFile) {
        formDataToSend.append("cvFile", cvFile)
      }
      if (videoFile) {
        formDataToSend.append("videoFile", videoFile)
      }

      const response = await fetch("/api/register/candidate", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        setServerError(data.error || "Registration failed. Please try again.")
        return
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user))
        localStorage.setItem("token", `candidate_token_${crypto.randomUUID()}`)
      }

      const redirect = searchParams.get("redirect")
      router.push(redirect?.startsWith("/") ? redirect : "/")
    } catch {
      setServerError("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />
      case 2:
        return (
          <JobProfileStep
            cvFile={cvFile}
            setCvFile={setCvFile}
            videoFile={videoFile}
            setVideoFile={setVideoFile}
          />
        )
      default:
        return null
    }
  }

  return (
    <FormProvider {...form}>
      <div className="site-container py-8">
        <div className="mx-auto mb-8 max-w-4xl">
          <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
            Create Your Profile
          </h1>
          <p className="mb-4 text-center text-muted-foreground">
            Complete your profile to get discovered by top companies
          </p>
          <p className="mb-6 text-center text-xs text-muted-foreground">
            Fill in your details below to create your profile.
          </p>
          {referralCode && (
            <div className="mb-6 flex justify-center">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1">
                <Link2 className="h-3.5 w-3.5" />
                You were referred — your profile will be linked to the referrer
              </Badge>
            </div>
          )}

          <FormStepper
            className="mb-8"
            currentStep={currentStep}
            steps={steps.map((s) => ({
              id: s.id,
              title: s.name,
              subtitle: s.subtitle,
              icon: s.icon,
            }))}
          />
        </div>

        <Card className="mx-auto max-w-4xl border-border shadow-lg">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={form.handleSubmit(onSubmit)}>
              {serverError && (
                <div className="mb-6 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {serverError}
                </div>
              )}
              {renderStep()}

              <div className="mt-8 flex justify-between border-t border-border pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="gap-2 bg-transparent"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={handleNext} className="gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="gap-2"
                    disabled={!acceptTerms || submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Profile
                        <CheckCircle className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  )
}
