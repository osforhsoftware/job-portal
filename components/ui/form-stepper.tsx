"use client"

import * as React from "react"
import type { LucideIcon } from "lucide-react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export type FormStepperStep = {
  id: number
  title: string
  subtitle: string
  icon: LucideIcon
}

type FormStepperProps = {
  steps: FormStepperStep[]
  currentStep: number
  className?: string
  /**
   * Override for the only connector (two-step flows). 0–100. When omitted, fill is
   * derived from current step (completed segments full, active segment partial).
   */
  lineFillPercent?: number
}

function segmentFillPercent(
  segmentIndex: number,
  n: number,
  currentStep: number,
  lineFillOverride: number | undefined,
): number {
  if (n < 2) return 0
  if (lineFillOverride != null && n === 2) {
    return lineFillOverride
  }
  if (segmentIndex < currentStep - 1) return 100
  if (segmentIndex > currentStep - 1) return 0
  return (currentStep / n) * 100
}

export function FormStepper({
  steps,
  currentStep,
  className,
  lineFillPercent: lineFillOverride,
}: FormStepperProps) {
  const n = steps.length

  return (
    <nav className={cn("w-full", className)} aria-label="Form progress">
      <div className="flex w-full min-w-0 items-start">
        {steps.map((step, i) => {
          const isActive = step.id === currentStep
          const isCompleted = step.id < currentStep
          const isUpcoming = !isActive && !isCompleted
          const StepIcon = step.icon
          const isLast = i === n - 1
          const segFill = segmentFillPercent(
            i,
            n,
            currentStep,
            lineFillOverride,
          )

          return (
            <React.Fragment key={step.id}>
              <div
                className="flex min-w-0 w-0 flex-1 flex-col items-center"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={cn(
                    "box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-all duration-500 ease-out sm:h-11 sm:w-11",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground ring-2 ring-primary/20 ring-offset-2 ring-offset-background",
                    isActive &&
                      "border-primary bg-primary/10 text-primary shadow-md ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                    isUpcoming &&
                      "border-border/90 bg-card text-muted-foreground shadow-sm",
                  )}
                >
                  {isCompleted ? (
                    <Check
                      className="h-4 w-4 sm:h-[18px] sm:w-[18px]"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  ) : (
                    <StepIcon
                      className={cn(
                        "h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-500",
                        isActive && "scale-110",
                      )}
                      aria-hidden
                    />
                  )}
                </div>

                <div className="mt-3 w-full min-w-0 px-1 text-center sm:mt-3.5 sm:px-2">
                  <p
                    className={cn(
                      "line-clamp-2 text-xs font-semibold leading-tight tracking-tight sm:text-sm",
                      isActive && "text-primary",
                      isCompleted && "text-foreground",
                      isUpcoming && "text-muted-foreground",
                    )}
                  >
                    {step.title}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[10px] leading-snug sm:mt-1 sm:text-xs",
                      isActive && "text-primary/80",
                      isCompleted && "text-muted-foreground",
                      isUpcoming && "text-muted-foreground/75",
                    )}
                  >
                    {step.subtitle}
                  </p>
                </div>
              </div>

              {!isLast && (
                <div
                  className="mt-0 flex w-0 min-w-[0.5rem] flex-1 shrink-0 flex-col self-start sm:min-w-[0.75rem]"
                  aria-hidden
                >
                  <div className="box-border flex h-10 w-full min-h-10 min-w-0 items-center sm:h-11 sm:min-h-[2.75rem]">
                    <div className="relative h-1.5 w-full min-w-0 overflow-hidden rounded-full">
                      <div
                        className="absolute inset-0 rounded-full bg-gradient-to-r from-muted/60 via-muted/40 to-muted/30 shadow-inner"
                        aria-hidden
                      />
                      <div
                        className="from-primary to-primary/90 absolute top-0 left-0 h-full rounded-full bg-gradient-to-r shadow-sm transition-[width] duration-500 ease-out"
                        style={{ width: `${segFill}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </nav>
  )
}
