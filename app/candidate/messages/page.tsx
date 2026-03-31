"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CandidateHubNav } from "@/components/candidate/candidate-hub-nav"
import { MessageSquare, LogIn, Send, Users } from "lucide-react"

export default function CandidateMessagesPage() {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("user")
      const token = localStorage.getItem("token")
      setLoggedIn(!!(stored && token))
    } catch {
      setLoggedIn(false)
    }
  }, [])

  if (loggedIn === null) {
    return (
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="mb-4 h-8 w-48 animate-pulse rounded bg-muted" />
        <div className="mb-6 h-10 w-full max-w-2xl animate-pulse rounded-lg bg-muted" />
        <div className="h-[480px] animate-pulse rounded-xl border bg-muted/30" />
      </div>
    )
  }

  if (!loggedIn) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <CandidateHubNav className="mb-6" />
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
              <LogIn className="h-7 w-7 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Sign in to use messages</h1>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                After you log in, you&apos;ll be able to chat with recruiters here once messaging is enabled for your account.
              </p>
            </div>
            <Button asChild>
              <Link href="/login/candidate?redirect=/candidate/messages">Sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground">
          One place for conversations with companies and agencies. Composer below is ready for a future live chat API.
        </p>
      </div>

      <CandidateHubNav className="mb-6" />

      <Card className="overflow-hidden p-0">
        <div className="flex min-h-[min(520px,calc(100vh-16rem))] flex-col md:flex-row">
          {/* Conversation list — wire to /api/... when backend exists */}
          <aside className="flex w-full flex-col border-b border-border md:w-80 md:border-b-0 md:border-r md:border-border">
            <div className="border-b border-border p-3">
              <Input
                type="search"
                placeholder="Search conversations…"
                disabled
                className="bg-muted/50"
                aria-describedby="search-soon"
              />
              <p id="search-soon" className="mt-1.5 px-1 text-[11px] text-muted-foreground">
                Search will be available when messaging goes live.
              </p>
            </div>
            <ScrollArea className="h-[280px] md:h-[min(440px,calc(100vh-20rem))]">
              <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted">
                  <Users className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No conversations yet</p>
                <p className="max-w-[240px] text-xs text-muted-foreground">
                  When a recruiter messages you, threads will list here. REST or WebSocket hooks can populate this panel.
                </p>
              </div>
            </ScrollArea>
          </aside>

           {/* Thread + composer placeholder */}
          <div className="flex flex-1 flex-col bg-muted/20">
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground" strokeWidth={1.25} />
              <div>
                <p className="font-medium text-foreground">Select a conversation</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Choose a thread from the list to read messages and reply. This area will render the active thread and
                  attachments.
                </p>
              </div>
            </div>

            <div className="border-t border-border bg-background p-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Write a message…"
                  disabled
                  className="flex-1 bg-muted/40"
                  aria-label="Message composer (coming soon)"
                />
                <Button type="button" size="icon" disabled aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="mt-2 text-center text-[11px] text-muted-foreground">
                Sender, timestamps, and read receipts can plug into the same footer when the API is ready.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
