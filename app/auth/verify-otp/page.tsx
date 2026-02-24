'use client'

import {
  IconAlertCircle,
  IconArrowLeft,
  IconLoader2,
  IconRefresh
} from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import { AuthFormPanel } from '@/components/auth/auth-form-panel'
import { OtpInput } from '@/components/auth/otp-input'
import { Button } from '@/components/ui/button'
import { forgotPassword, verifyOtp } from '@/lib/api/auth'
import type { AuthError } from '@/types/auth'

const OTP_LENGTH = 6
const RESEND_COOLDOWN = 30 // seconds

export default function VerifyOtpPage() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''

  const [otp, setOtp] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Countdown timer for resend
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimer = useCallback(() => {
    setCountdown(RESEND_COOLDOWN)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return c - 1
      })
    }, 1000)
  }, [])

  useEffect(() => {
    startTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [startTimer])

  // Auto-submit when all digits are entered
  useEffect(() => {
    if (otp.replace(/\s/g, '').length === OTP_LENGTH && !isVerifying) {
      handleVerify()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp])

  const handleVerify = async () => {
    if (otp.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    setIsVerifying(true)
    setError(null)

    try {
      const res = await verifyOtp({ email, otp })
      router.push(
        `/auth/change-password?token=${encodeURIComponent(res.resetToken)}&email=${encodeURIComponent(email)}`
      )
    } catch (err) {
      const ae = err as AuthError
      setError(ae.message ?? 'Verification failed. Try again.')
      setOtp('')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    if (countdown > 0 || isResending) return
    setIsResending(true)
    setError(null)
    setResendSuccess(false)

    try {
      await forgotPassword({ email })
      setResendSuccess(true)
      startTimer()
      setTimeout(() => setResendSuccess(false), 4000)
    } catch (err) {
      const ae = err as AuthError
      setError(ae.message ?? 'Could not resend. Try again.')
    } finally {
      setIsResending(false)
    }
  }

  const maskedEmail =
    email && email.includes('@') ?
      email.slice(0, 2) + '***@' + email.split('@')[1]
    : 'your email'

  return (
    <AuthFormPanel>
      <Link
        href={`/auth/forgot-password`}
        className='mb-8 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground'
      >
        <IconArrowLeft size={15} />
        Back
      </Link>

      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Enter verification code
        </h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          We sent a 6-digit code to{' '}
          <span className='font-medium text-foreground'>{maskedEmail}</span>.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          <IconAlertCircle size={15} className='shrink-0' />
          {error}
        </div>
      )}

      {/* Resend success */}
      {resendSuccess && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400'>
          <svg
            width='14'
            height='14'
            viewBox='0 0 15 15'
            fill='none'
            aria-hidden
          >
            <path
              d='M11.5 3.5L6 9.5L3.5 7'
              stroke='currentColor'
              strokeWidth='1.5'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          A new code has been sent.
        </div>
      )}

      <div className='flex flex-col items-center gap-8'>
        {/* OTP input */}
        <OtpInput
          value={otp}
          onChange={(v) => {
            setOtp(v)
            setError(null)
          }}
          disabled={isVerifying}
          hasError={!!error}
        />

        {/* Verify button */}
        <Button
          size='lg'
          disabled={otp.length < OTP_LENGTH || isVerifying}
          onClick={handleVerify}
          className='w-full rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90'
        >
          {isVerifying ?
            <>
              <IconLoader2 size={15} className='animate-spin' />
              Verifying…
            </>
          : 'Verify code'}
        </Button>

        {/* Resend */}
        <div className='flex items-center gap-1.5 text-sm text-muted-foreground'>
          Didn&apos;t receive it?{' '}
          {countdown > 0 ?
            <span>
              Resend in{' '}
              <span className='tabular-nums font-medium text-foreground'>
                {countdown}s
              </span>
            </span>
          : <button
              type='button'
              onClick={handleResend}
              disabled={isResending}
              className='flex items-center gap-1 font-medium text-[#1F889E] underline-offset-4 hover:underline disabled:opacity-50'
            >
              {isResending ?
                <IconLoader2 size={13} className='animate-spin' />
              : <IconRefresh size={13} />}
              Resend
            </button>
          }
        </div>
      </div>
    </AuthFormPanel>
  )
}
