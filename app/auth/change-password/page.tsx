'use client'

import {
  IconAlertCircle,
  IconCheck,
  IconLoader2,
  IconLock
} from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

import { AuthFormPanel } from '@/components/auth/auth-form-panel'
import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { resetPassword } from '@/lib/api/auth'
import type { AuthError } from '@/types/auth'

// ─── Password strength ────────────────────────────────────────────────────────

interface StrengthRule {
  label: string
  test: (p: string) => boolean
}

const STRENGTH_RULES: StrengthRule[] = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
  { label: 'One number', test: (p) => /\d/.test(p) },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) }
]

function getStrength(password: string) {
  return STRENGTH_RULES.filter((r) => r.test(password)).length
}

function StrengthBar({ password }: { password: string }) {
  if (!password) return null
  const score = getStrength(password)
  const bars = STRENGTH_RULES.length

  const color =
    score <= 1 ? 'bg-destructive'
    : score <= 2 ? 'bg-amber-500'
    : score <= 3 ? 'bg-yellow-400'
    : score === 4 ? 'bg-emerald-400'
    : 'bg-emerald-500'

  const label =
    score <= 1 ? 'Very weak'
    : score <= 2 ? 'Weak'
    : score <= 3 ? 'Fair'
    : score === 4 ? 'Good'
    : 'Strong'

  return (
    <div className='mt-2 flex flex-col gap-2'>
      <div className='flex gap-1'>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${i < score ? color : 'bg-border'}`}
          />
        ))}
      </div>
      <div className='flex items-center justify-between'>
        <p className='text-xs text-muted-foreground'>Strength:</p>
        <p className={`text-xs font-medium ${color.replace('bg-', 'text-')}`}>
          {label}
        </p>
      </div>
      <ul className='grid grid-cols-2 gap-x-4 gap-y-1'>
        {STRENGTH_RULES.map((rule) => {
          const pass = rule.test(password)
          return (
            <li
              key={rule.label}
              className='flex items-center gap-1.5 text-[11px]'
            >
              <IconCheck
                size={11}
                className={
                  pass ? 'text-emerald-500' : 'text-muted-foreground/40'
                }
                strokeWidth={3}
              />
              <span
                className={
                  pass ? 'text-foreground' : 'text-muted-foreground/60'
                }
              >
                {rule.label}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function ChangePasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = params.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<'password' | 'confirmPassword' | 'root', string>>
  >({})

  // Guard: no token
  if (!token) {
    return (
      <AuthFormPanel>
        <div className='flex flex-col items-center gap-5 text-center'>
          <div className='flex size-16 items-center justify-center rounded-full bg-destructive/10'>
            <IconLock size={26} className='text-destructive' />
          </div>
          <div>
            <h1 className='text-xl font-bold'>Session expired</h1>
            <p className='mt-1.5 text-sm text-muted-foreground'>
              Your password reset link is invalid or has expired.
            </p>
          </div>
          <Link
            href='/auth/forgot-password'
            className='text-sm font-medium text-[#1F889E] underline-offset-4 hover:underline'
          >
            Request a new link
          </Link>
        </div>
      </AuthFormPanel>
    )
  }

  const validate = () => {
    const next: typeof errors = {}
    if (!password) next.password = 'Password is required.'
    else if (password.length < 8)
      next.password = 'Must be at least 8 characters.'
    if (!confirmPassword) next.confirmPassword = 'Please confirm your password.'
    else if (password !== confirmPassword)
      next.confirmPassword = 'Passwords do not match.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})

    try {
      await resetPassword({ token, password, confirmPassword })
      router.push('/auth/sign-in?reset=success')
    } catch (err) {
      const ae = err as AuthError
      if (ae.field === 'password' || ae.field === 'confirmPassword') {
        setErrors({ [ae.field]: ae.message })
      } else {
        setErrors({ root: ae.message ?? 'Something went wrong. Try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFormPanel>
      <div className='mb-8 flex items-center gap-4'>
        <div className='flex size-11 items-center justify-center rounded-full bg-linear-to-br from-[#1F889E]/20 to-[#20B482]/20'>
          <IconLock size={20} className='text-[#1F889E]' />
        </div>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>
            Set new password
          </h1>
          <p className='text-sm text-muted-foreground'>
            Choose a strong password for your account.
          </p>
        </div>
      </div>

      {errors.root && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          <IconAlertCircle size={15} className='shrink-0' />
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
        {/* New password */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='password'>New password</Label>
          <PasswordInput
            id='password'
            placeholder='••••••••'
            autoComplete='new-password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setErrors((prev) => ({ ...prev, password: undefined }))
            }}
            hasError={!!errors.password}
            disabled={isLoading}
          />
          {errors.password ?
            <p className='text-xs text-destructive'>{errors.password}</p>
          : <StrengthBar password={password} />}
        </div>

        {/* Confirm password */}
        <div className='flex flex-col gap-1.5'>
          <Label htmlFor='confirm'>Confirm new password</Label>
          <PasswordInput
            id='confirm'
            placeholder='••••••••'
            autoComplete='new-password'
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
            }}
            hasError={!!errors.confirmPassword}
            disabled={isLoading}
          />
          {errors.confirmPassword && (
            <p className='text-xs text-destructive'>{errors.confirmPassword}</p>
          )}
          {/* Match indicator */}
          {confirmPassword &&
            !errors.confirmPassword &&
            password === confirmPassword && (
              <p className='flex items-center gap-1 text-xs text-emerald-500'>
                <IconCheck size={12} strokeWidth={3} /> Passwords match
              </p>
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
              Updating password…
            </>
          : 'Update password'}
        </Button>
      </form>
    </AuthFormPanel>
  )
}

export default function ChangePasswordPage() {
  return (
    <Suspense>
      <ChangePasswordContent />
    </Suspense>
  )
}
