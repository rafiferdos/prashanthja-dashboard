'use client'

import { IconEye, IconEyeOff } from '@tabler/icons-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

type PasswordInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  hasError?: boolean
}

export function PasswordInput({
  className,
  hasError,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className='relative'>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        data-slot='input'
        className={cn(
          `
            bg-input/30 border-input focus-visible:border-[#1F889E]
            focus-visible:ring-[#1F889E]/25 h-9 w-full rounded-4xl border
            px-3 py-1 pr-10 text-sm outline-none transition-all
            focus-visible:ring-[3px]
            placeholder:text-muted-foreground
            disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50
          `,
          hasError && 'border-destructive ring-2 ring-destructive/25',
          className
        )}
      />
      <button
        type='button'
        tabIndex={-1}
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        className='
          absolute inset-y-0 right-0 flex items-center px-3
          text-muted-foreground transition-colors hover:text-foreground
          focus-visible:outline-none
        '
      >
        {visible ?
          <IconEyeOff size={15} />
        : <IconEye size={15} />}
      </button>
    </div>
  )
}
