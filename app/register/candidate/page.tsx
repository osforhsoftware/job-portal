"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CandidateRegistrationWizard } from "@/components/candidate/registration-wizard"

export default function CandidateRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <CandidateRegistrationWizard />
      </main>
      <Footer />
    </div>
  )
}
