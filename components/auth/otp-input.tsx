'use client'

import { cn } from '@/lib/utils'
import { useCallback, useRef } from 'react'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  hasError?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  hasError = false
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = value.padEnd(length, '').slice(0, length).split('')

  const focusAt = useCallback(
    (index: number) => {
      inputRefs.current[Math.max(0, Math.min(index, length - 1))]?.focus()
    },
    [length]
  )

  const handleChange = useCallback(
    (index: number, raw: string) => {
      // Only keep digits
      const cleaned = raw.replace(/\D/g, '')
      if (!cleaned) return

      // Support paste: fill from current index forward
      const arr = value.padEnd(length, '').slice(0, length).split('')
      for (let i = 0; i < cleaned.length && index + i < length; i++) {
        arr[index + i] = cleaned[i]
      }
      const next = arr.join('')
      onChange(next.slice(0, length))

      const nextIndex = Math.min(index + cleaned.length, length - 1)
      setTimeout(() => focusAt(nextIndex), 0)
    },
    [value, length, onChange, focusAt]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const arr = value.padEnd(length, '').slice(0, length).split('')
        if (arr[index]) {
          arr[index] = ''
          onChange(arr.join(''))
        } else if (index > 0) {
          arr[index - 1] = ''
          onChange(arr.join(''))
          focusAt(index - 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusAt(index - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusAt(index + 1)
      }
    },
    [value, length, onChange, focusAt]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData
        .getData('text')
        .replace(/\D/g, '')
        .slice(0, length)
      onChange(pasted.padEnd(length, '').slice(0, length))
      focusAt(Math.min(pasted.length, length - 1))
    },
    [length, onChange, focusAt]
  )

  const handleFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select()
  }, [])

  return (
    <div className='flex items-center gap-2.5'>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          type='text'
          inputMode='numeric'
          pattern='\d*'
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${i + 1}`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={handleFocus}
          className={cn(
            `
              h-12 w-10 rounded-xl border text-center text-lg font-semibold
              bg-input/30 outline-none transition-all
              focus:border-[#1F889E] focus:ring-2 focus:ring-[#1F889E]/25
              disabled:cursor-not-allowed disabled:opacity-50
              caret-transparent select-all
            `,
            hasError ?
              'border-destructive ring-2 ring-destructive/25'
            : 'border-input',
            digit ? 'bg-[#1F889E]/5 border-[#1F889E]/50' : ''
          )}
        />
      ))}
    </div>
  )
}
