"use client"

import React from "react"

import { useRef } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, FileText, ImageIcon, File, X, Check } from "lucide-react"
import type { CandidateFormData } from "../registration-wizard"

interface DocumentsStepProps {
  formData: CandidateFormData
  updateFormData: (data: Partial<CandidateFormData>) => void
}

export function DocumentsStep({ formData, updateFormData }: DocumentsStepProps) {
  const cvInputRef = useRef<HTMLInputElement>(null)
  const photoInputRef = useRef<HTMLInputElement>(null)
  const passportInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "cvFile" | "photoFile" | "passportFile"
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      updateFormData({ [field]: file })
    }
  }

  const removeFile = (field: "cvFile" | "photoFile" | "passportFile") => {
    updateFormData({ [field]: null })
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-xl font-semibold text-foreground">Documents</h2>
        <p className="text-sm text-muted-foreground">
          Upload your CV, photo, and identification documents
        </p>
      </div>

      {/* CV Upload */}
      <Card className="border-2 border-dashed p-6">
        <input
          ref={cvInputRef}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "cvFile")}
        />
        
        {formData.cvFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.cvFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(formData.cvFile.size)}
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
                onClick={() => removeFile("cvFile")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center py-6"
            onClick={() => cvInputRef.current?.click()}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <Upload className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mb-1 font-medium text-foreground">Upload CV/Resume *</p>
            <p className="text-sm text-muted-foreground">
              PDF, DOC, or DOCX (Max 5MB)
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" type="button">
              Choose File
            </Button>
          </div>
        )}
      </Card>

      {/* Photo Upload */}
      <Card className="border-2 border-dashed p-6">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "photoFile")}
        />
        
        {formData.photoFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <ImageIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.photoFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(formData.photoFile.size)}
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
                onClick={() => removeFile("photoFile")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center py-6"
            onClick={() => photoInputRef.current?.click()}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <ImageIcon className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mb-1 font-medium text-foreground">Upload Photo *</p>
            <p className="text-sm text-muted-foreground">
              JPG, PNG (Passport size, Max 2MB)
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" type="button">
              Choose File
            </Button>
          </div>
        )}
      </Card>

      {/* Passport Upload */}
      <Card className="border-2 border-dashed p-6">
        <input
          ref={passportInputRef}
          type="file"
          accept=".pdf,image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, "passportFile")}
        />
        
        {formData.passportFile ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium text-foreground">{formData.passportFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(formData.passportFile.size)}
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
                onClick={() => removeFile("passportFile")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="flex cursor-pointer flex-col items-center justify-center py-6"
            onClick={() => passportInputRef.current?.click()}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <File className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="mb-1 font-medium text-foreground">Upload Passport/ID (Optional)</p>
            <p className="text-sm text-muted-foreground">
              PDF or Image (Max 5MB)
            </p>
            <Button variant="outline" className="mt-4 bg-transparent" type="button">
              Choose File
            </Button>
          </div>
        )}
      </Card>

      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> A complete profile with all documents increases your chances of getting shortlisted by 3x.
          Your documents are securely stored and only shared with potential employers after your approval.
        </p>
      </div>
    </div>
  )
}
