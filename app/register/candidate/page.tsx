"use client"

import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { CandidateRegistrationWizard } from "@/components/candidate/registration-wizard"

export default function CandidateRegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-background">
        <Suspense fallback={<div className="container mx-auto flex min-h-[400px] items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>}>
          <CandidateRegistrationWizard />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
