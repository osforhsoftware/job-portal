import * as React from 'react'

import { cn } from '@/lib/utils'

const textareaClassName = cn(
  'border-input placeholder:text-muted-foreground focus-visible:border-ring/50 focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
)

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  function Textarea({ className, value, defaultValue, ...props }, ref) {
    const uncontrolledWithDefault = defaultValue !== undefined && value === undefined

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        className={cn(textareaClassName, className)}
        {...(uncontrolledWithDefault ? { defaultValue } : { value: value ?? '' })}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
