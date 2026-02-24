'use client'

import {
  IconAlertCircle,
  IconArrowLeft,
  IconLoader2,
  IconMailFilled
} from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { AuthFormPanel } from '@/components/auth/auth-form-panel'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { forgotPassword } from '@/lib/api/auth'
import type { AuthError } from '@/types/auth'

type Step = 'form' | 'sent'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [step, setStep] = useState<Step>('form')
  const [maskedEmail, setMaskedEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<'email' | 'root', string>>
  >({})

  const validate = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required.' })
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: 'Enter a valid email.' })
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})

    try {
      const res = await forgotPassword({ email: email.trim() })
      setMaskedEmail(res.maskedEmail)
      setStep('sent')
    } catch (err) {
      const ae = err as AuthError
      setErrors({ root: ae.message ?? 'Something went wrong. Try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify = () => {
    router.push(`/auth/verify-otp?email=${encodeURIComponent(email.trim())}`)
  }

  // ── Sent state ──────────────────────────────────────────────────────────────

  if (step === 'sent') {
    return (
      <AuthFormPanel>
        <div className='flex flex-col items-center gap-5 text-center'>
          <div className='flex size-16 items-center justify-center rounded-full bg-linear-to-br from-[#1F889E]/20 to-[#20B482]/20'>
            <IconMailFilled size={28} className='text-[#1F889E]' />
          </div>

          <div>
            <h1 className='text-2xl font-bold tracking-tight'>
              Check your inbox
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              We sent a 6-digit verification code to{' '}
              <span className='font-medium text-foreground'>{maskedEmail}</span>
              .
              <br className='hidden sm:block' /> It expires in 5 minutes.
            </p>
          </div>

          <Button
            size='lg'
            className='mt-2 w-full rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90'
            onClick={handleVerify}
          >
            Enter verification code
          </Button>

          <button
            type='button'
            onClick={() => {
              setStep('form')
              setErrors({})
            }}
            className='text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
          >
            Use a different email
          </button>

          <Link
            href='/auth/sign-in'
            className='flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
          >
            <IconArrowLeft size={12} />
            Back to sign in
          </Link>
        </div>
      </AuthFormPanel>
    )
  }

  // ── Form state ──────────────────────────────────────────────────────────────

  return (
    <AuthFormPanel>
      <Link
        href='/auth/sign-in'
        className='mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
      >
        <IconArrowLeft size={15} />
        Back to sign in
      </Link>

      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Forgot password?</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Enter your email and we&apos;ll send you a verification code.
        </p>
      </div>

      {errors.root && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          <IconAlertCircle size={15} className='shrink-0' />
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='email'>Email address</Label>
          <Input
            id='email'
            type='email'
            placeholder='you@example.com'
            autoComplete='email'
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              setErrors({})
            }}
            aria-invalid={!!errors.email}
            disabled={isLoading}
          />
          {errors.email && (
            <p className='text-xs text-destructive'>{errors.email}</p>
          )}
        </div>

        <Button
          type='submit'
          size='lg'
          disabled={isLoading}
          className='mt-1 w-full rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90'
        >
          {isLoading ?
            <>
              <IconLoader2 size={15} className='animate-spin' />
              Sending code…
            </>
          : 'Send verification code'}
        </Button>
      </form>
    </AuthFormPanel>
  )
}
