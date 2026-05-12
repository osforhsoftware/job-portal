"use client"

import React, { useState, useRef, useCallback, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Video,
  Upload,
  FileText,
  Check,
  X,
  Circle,
  Square,
} from "lucide-react"
import { JobCategorySelector } from "../job-category-selector"
import type { CandidateRegisterFormValues } from "../candidate-register-schema"
import { cn } from "@/lib/utils"

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

const qualifications = [
  "High School",
  "Diploma",
  "Vocational Training",
  "Bachelor's Degree",
  "Master's Degree",
  "PhD/Doctorate",
  "Professional Certification",
  "Other"
]

const MAX_DURATION = 60
const MAX_CV_SIZE = 5 * 1024 * 1024

interface JobProfileStepProps {
  cvFile: File | null
  setCvFile: (file: File | null) => void
  videoFile: File | null
  setVideoFile: (file: File | null) => void
}

export function JobProfileStep({
  cvFile,
  setCvFile,
  videoFile,
  setVideoFile,
}: JobProfileStepProps) {
  const form = useFormContext<CandidateRegisterFormValues>()
  const [videoMode, setVideoMode] = useState<"select" | "record" | "upload" | "preview">("select")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [mediaError, setMediaError] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)

  const salaryMin = form.watch("salaryMin")
  const salaryMax = form.watch("salaryMax")
  const cvDocError = form.formState.errors.cvDocument

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const handleCVSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > MAX_CV_SIZE) {
        form.setError("cvDocument", {
          type: "manual",
          message: `File too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`,
        })
        return
      }
      if (file.type !== "application/pdf") {
        form.setError("cvDocument", {
          type: "manual",
          message: "Please upload a PDF file only.",
        })
        return
      }
      form.clearErrors("cvDocument")
      setCvFile(file)
    }
  }

  const removeCV = () => {
    setCvFile(null)
    if (cvInputRef.current) {
      cvInputRef.current.value = ""
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const startCamera = useCallback(async () => {
    setMediaError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: true,
      })
      setStream(mediaStream)
      setVideoMode("record")
    } catch (err) {
      console.error("Error accessing camera:", err)
      setMediaError("Unable to access camera. Please check permissions.")
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }
  }, [stream])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
    }
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setIsRecording(false)
  }, [])

  const startRecording = useCallback(() => {
    if (!stream) return

    chunksRef.current = []
    const mediaRecorder = new MediaRecorder(stream, { mimeType: "video/webm" })

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" })
      const file = new File([blob], "video-profile.webm", { type: "video/webm" })
      setVideoFile(file)
      setVideoMode("preview")
      stopCamera()
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
    setRecordingTime(0)

    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => {
        if (prev >= MAX_DURATION - 1) {
          stopRecording()
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }, [stream, stopCamera, setVideoFile, stopRecording])

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMediaError(null)
      if (file.size > 50 * 1024 * 1024) {
        setMediaError("Video file too large. Maximum size is 50MB.")
        return
      }
      setVideoFile(file)
      setVideoMode("preview")
    }
  }

  const resetVideo = () => {
    setVideoFile(null)
    setVideoMode("select")
    setRecordingTime(0)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Job & Profile Details</h2>
        <p className="text-sm text-muted-foreground">
          Complete your profile to get discovered by employers
        </p>
      </div>

      <FormField
        control={form.control}
        name="jobCategories"
        render={({ field }) => (
          <FormItem>
            <JobCategorySelector
              selectedCategories={field.value || []}
              onSelectionChange={field.onChange}
              required
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={form.control}
          name="totalExperience"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Years Experience *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {experienceYears.map((exp) => (
                    <SelectItem key={exp} value={exp.toLowerCase()}>
                      {exp}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="qualification"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Qualification{" "}
                <span className="text-muted-foreground font-normal">(optional)</span>
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select qualification (optional)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {qualifications.map((qual) => (
                    <SelectItem key={qual} value={qual.toLowerCase()}>
                      {qual}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="cvDocument"
        render={() => (
          <FormItem>
            <FormLabel>Upload CV/Resume *</FormLabel>
            <Card
              className={cn(
                "border-2 border-dashed p-6",
                cvDocError ? "border-destructive" : "",
              )}
            >
              <input
                ref={cvInputRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleCVSelect}
              />

              {cvFile ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <FileText className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{cvFile.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(cvFile.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                      <Check className="h-4 w-4 text-success" />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={removeCV}
                      type="button"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex cursor-pointer flex-col items-center justify-center py-6"
                  onClick={() => cvInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault()
                      cvInputRef.current?.click()
                    }
                  }}
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-7 w-7 text-muted-foreground" />
                  </div>
                  <p className="mb-1 font-medium text-foreground">Upload CV/Resume *</p>
                  <p className="text-sm text-muted-foreground">PDF only (Max 5MB)</p>
                  <Button variant="outline" className="mt-4 bg-transparent" type="button">
                    Choose File
                  </Button>
                </div>
              )}
            </Card>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="space-y-2">
        <Label>Record Video Self-Introduction (Optional)</Label>
        <p className="text-xs text-muted-foreground mb-4">
          Record a 1-minute video introducing yourself (optional)
        </p>

        {mediaError && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {mediaError}
          </p>
        )}

        <div className="rounded-lg bg-primary/5 p-4 mb-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">Tips for a Great Video</h3>
          <ul className="space-y-1 text-xs text-muted-foreground">
            <li>• Introduce yourself and mention your profession</li>
            <li>• Highlight 2-3 key skills and achievements</li>
            <li>• Speak clearly and maintain eye contact</li>
            <li>• Good lighting and quiet background</li>
            <li>• Keep it under 60 seconds</li>
          </ul>
        </div>

        {videoMode === "select" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <Card
              className="cursor-pointer border-2 p-6 transition-all hover:border-primary"
              onClick={startCamera}
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Video className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Record Now</h3>
                <p className="text-sm text-muted-foreground">
                  Use your camera to record a video introduction
                </p>
              </div>
            </Card>

            <Card
              className="cursor-pointer border-2 p-6 transition-all hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={handleVideoUpload}
              />
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                  <Upload className="h-8 w-8 text-accent" />
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Upload Video</h3>
                <p className="text-sm text-muted-foreground">
                  Upload a pre-recorded video (Max 50MB)
                </p>
              </div>
            </Card>
          </div>
        )}

        {videoMode === "record" && (
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
              />

              {isRecording && (
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-destructive px-3 py-1">
                  <Circle className="h-3 w-3 animate-pulse fill-current" />
                  <span className="text-sm font-medium text-destructive-foreground">REC</span>
                </div>
              )}

              <div className="absolute right-4 top-4 rounded-full bg-black/50 px-3 py-1">
                <span className="text-sm font-mono text-white">
                  {formatTime(recordingTime)} / {formatTime(MAX_DURATION)}
                </span>
              </div>

              {isRecording && (
                <div className="absolute bottom-0 left-0 right-0">
                  <Progress value={(recordingTime / MAX_DURATION) * 100} className="h-1 rounded-none" />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 p-4">
              {!isRecording ? (
                <>
                  <Button variant="outline" onClick={() => { stopCamera(); setVideoMode("select") }} type="button">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={startRecording} className="gap-2" type="button">
                    <Circle className="h-4 w-4 fill-current" />
                    Start Recording
                  </Button>
                </>
              ) : (
                <Button variant="destructive" onClick={stopRecording} className="gap-2" type="button">
                  <Square className="h-4 w-4 fill-current" />
                  Stop Recording
                </Button>
              )}
            </div>
          </Card>
        )}

        {videoMode === "preview" && videoFile && (
          <Card className="overflow-hidden">
            <div className="relative aspect-video bg-black">
              <video
                src={URL.createObjectURL(videoFile)}
                controls
                className="h-full w-full object-cover"
              />
              <div className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-success">
                <Check className="h-5 w-5 text-success-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-success" />
                <span className="font-medium text-foreground">Video uploaded successfully</span>
              </div>
              <Button variant="outline" onClick={resetVideo} type="button">
                <X className="mr-2 h-4 w-4" />
                Re-record
              </Button>
            </div>
          </Card>
        )}
      </div>

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
                {salaryMin || 500} AED / month
              </span>
            </div>
            <Slider
              value={[salaryMin || 500]}
              onValueChange={(values) => {
                const next = values[0]
                const max = form.getValues("salaryMax")
                form.setValue("salaryMin", next, { shouldValidate: true, shouldDirty: true })
                if (next > max) {
                  form.setValue("salaryMax", next, { shouldValidate: true })
                }
              }}
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
                {salaryMax || 5000} AED / month
              </span>
            </div>
            <Slider
              value={[salaryMax || 5000]}
              onValueChange={(values) => {
                const next = values[0]
                const min = form.getValues("salaryMin")
                form.setValue("salaryMax", next, { shouldValidate: true, shouldDirty: true })
                if (next < min) {
                  form.setValue("salaryMin", next, { shouldValidate: true })
                }
              }}
              min={500}
              max={10000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="mt-4 rounded-lg bg-primary/5 p-3 text-center">
            <p className="text-sm font-medium text-foreground">
              Salary Range: AED {(salaryMin || 500).toLocaleString()} - AED {(salaryMax || 5000).toLocaleString()} / month
            </p>
          </div>
          {form.formState.errors.salaryMax?.message && (
            <p className="text-sm text-destructive">{form.formState.errors.salaryMax.message}</p>
          )}
        </div>
      </div>

      <FormField
        control={form.control}
        name="acceptTerms"
        render={({ field }) => (
          <FormItem className="space-y-3 rounded-lg border p-4">
            <div className="flex items-start space-x-3">
              <FormControl>
                <Checkbox
                  id="terms"
                  checked={field.value}
                  onCheckedChange={(c) => field.onChange(c === true)}
                />
              </FormControl>
              <div className="space-y-1">
                <FormLabel htmlFor="terms" className="text-sm font-medium leading-snug cursor-pointer">
                  I accept the{" "}
                  <a href="/terms" className="text-primary hover:underline font-normal" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-primary hover:underline font-normal" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </a>{" "}*
                </FormLabel>
                <p className="text-xs text-muted-foreground">
                  By checking this box, you also agree to our{" "}
                  <a href="/acceptable-use" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Acceptable Use Policy
                  </a>{" "}and{" "}
                  <a href="/cookies" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                    Cookie Policy
                  </a>. Please read them before submitting your profile.
                </p>
                <FormMessage />
              </div>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
