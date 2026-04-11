"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const items: { q: string; a: string }[] = [
  {
    q: "What is OneMyJob?",
    a: "OneMyJob is a recruitment platform where companies publish open roles, candidates apply and manage their profile, and agencies can submit candidates—often with structured bidding so offers are easy to compare.",
  },
  {
    q: "Who can register?",
    a: "We support job seekers (candidates), employers (companies), recruitment agencies, and agents working under an agency. Each role gets a tailored dashboard and permissions.",
  },
  {
    q: "How do I apply for a job?",
    a: "Open Find Jobs, filter by category, location, or keywords, then sign in or create a candidate account. From a job card you can view details and submit an application with your profile and CV.",
  },
  {
    q: "How does bidding work?",
    a: "Where enabled for a role, companies and agencies can place comparable offers or terms through the platform. The goal is transparency: you see structured information instead of opaque email threads. Exact rules can vary by employer settings.",
  },
  {
    q: "Is my data secure?",
    a: "We use role-based access so candidates, companies, and agencies only see what they need. You should still avoid sharing passwords or sensitive IDs in chat; use official document flows when the product provides them.",
  },
  {
    q: "How do agencies work with companies?",
    a: "Agencies browse open demands, align candidates from their pool, and submit them against specific roles. Companies receive submissions in one place and can shortlist or progress candidates without duplicate spreadsheets.",
  },
  {
    q: "What if I forget my password?",
    a: "Use the login page and the password reset option for your account type. If email delivery fails, contact support with the email on file so we can verify and help.",
  },
  {
    q: "Where can I get help?",
    a: "Email support@onemyjob.com or visit the Contact Us page for our location. Include your role (candidate, company, agency) and a screenshot if something looks wrong in the app.",
  },
]

export function FaqPageContent() {
  return (
    <Accordion type="single" collapsible className="w-full">
      {items.map((item, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger className="text-left text-base font-medium">
            {item.q}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {item.a}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
