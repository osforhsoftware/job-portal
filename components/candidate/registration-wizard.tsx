"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import {
  User,
  Briefcase,
  GraduationCap,
  FileText,
  Video,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
} from "lucide-react"
import { PersonalInfoStep } from "./steps/personal-info-step"
import { WorkExperienceStep } from "./steps/work-experience-step"
import { EducationSkillsStep } from "./steps/education-skills-step"
import { DocumentsStep } from "./steps/documents-step"
import { VideoProfileStep } from "./steps/video-profile-step"
import { ReviewSubmitStep } from "./steps/review-submit-step"

const steps = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Experience", icon: Briefcase },
  { id: 3, name: "Education & Skills", icon: GraduationCap },
  { id: 4, name: "Documents", icon: FileText },
  { id: 5, name: "Video Profile", icon: Video },
  { id: 6, name: "Review & Submit", icon: CheckCircle },
]

export type CandidateFormData = {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  gender: string
  nationality: string
  currentLocation: string
  preferredLocations: string[]
  languages: string[]
  maritalStatus: string
  // Work Experience
  totalExperience: string
  currentJobTitle: string
  currentCompany: string
  currentSalary: string
  expectedSalary: string
  noticePeriod: string
  industries: string[]
  jobTypes: string[]
  // Education & Skills
  highestEducation: string
  fieldOfStudy: string
  skills: string[]
  certifications: string[]
  // Documents
  cvFile: File | null
  photoFile: File | null
  passportFile: File | null
  // Video
  videoFile: File | null
  videoUrl: string
  // Terms
  acceptTerms: boolean
  acceptServiceCharge: boolean
}

const initialFormData: CandidateFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  currentLocation: "",
  preferredLocations: [],
  languages: [],
  maritalStatus: "",
  totalExperience: "",
  currentJobTitle: "",
  currentCompany: "",
  currentSalary: "",
  expectedSalary: "",
  noticePeriod: "",
  industries: [],
  jobTypes: [],
  highestEducation: "",
  fieldOfStudy: "",
  skills: [],
  certifications: [],
  cvFile: null,
  photoFile: null,
  passportFile: null,
  videoFile: null,
  videoUrl: "",
  acceptTerms: false,
  acceptServiceCharge: false,
}

export function CandidateRegistrationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<CandidateFormData>(initialFormData)

  const progress = (currentStep / steps.length) * 100

  const updateFormData = (data: Partial<CandidateFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Here you would submit the form data to your API
    console.log("Submitting form data:", formData)
    router.push("/candidate/dashboard")
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep formData={formData} updateFormData={updateFormData} />
      case 2:
        return <WorkExperienceStep formData={formData} updateFormData={updateFormData} />
      case 3:
        return <EducationSkillsStep formData={formData} updateFormData={updateFormData} />
      case 4:
        return <DocumentsStep formData={formData} updateFormData={updateFormData} />
      case 5:
        return <VideoProfileStep formData={formData} updateFormData={updateFormData} />
      case 6:
        return <ReviewSubmitStep formData={formData} updateFormData={updateFormData} />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Header */}
      <div className="mx-auto mb-8 max-w-4xl">
        <h1 className="mb-2 text-center text-3xl font-bold text-foreground">
          Create Your Profile
        </h1>
        <p className="mb-6 text-center text-muted-foreground">
          Complete your profile to get discovered by top companies
        </p>

        {/* Progress Bar */}
        <Progress value={progress} className="mb-6 h-2" />

        {/* Step Indicators */}
        <div className="flex justify-between">
          {steps.map((step) => {
            const StepIcon = step.icon
            const isActive = step.id === currentStep
            const isCompleted = step.id < currentStep

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? "border-primary bg-primary text-primary-foreground"
                      : isActive
                        ? "border-primary bg-background text-primary"
                        : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`mt-2 hidden text-xs font-medium sm:block ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Step Content */}
      <Card className="mx-auto max-w-4xl border-border shadow-lg">
        <CardContent className="p-6 md:p-8">
          {renderStep()}

          {/* Navigation Buttons */}
          <div className="mt-8 flex justify-between border-t border-border pt-6">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
              className="gap-2 bg-transparent"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < steps.length ? (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="gap-2">
                Submit Profile
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
