'use client'

import { IconAlertCircle, IconLoader2 } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { AuthFormPanel } from '@/components/auth/auth-form-panel'
import { PasswordInput } from '@/components/auth/password-input'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth.store'
import type { AuthError } from '@/types/auth'

export default function SignInPage() {
  const router = useRouter()
  const params = useSearchParams()
  const setAuth = useAuthStore((s) => s.setAuth)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<
    Partial<Record<'email' | 'password' | 'root', string>>
  >({})

  // Show "Password reset successfully" banner when redirected from change-password
  const justReset = params.get('reset') === 'success'

  // Clear field error on change
  const clearError = (field: keyof typeof errors) =>
    setErrors((e) => ({ ...e, [field]: undefined }))

  const validate = () => {
    const next: typeof errors = {}
    if (!email.trim()) next.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      next.email = 'Enter a valid email.'
    if (!password) next.password = 'Password is required.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsLoading(true)
    setErrors({})

    try {
      const res = await signIn({ email: email.trim(), password })
      setAuth(res.user, res.accessToken)
      router.push('/dashboard')
    } catch (err) {
      const ae = err as AuthError
      if (ae.field === 'email' || ae.field === 'password') {
        setErrors({ [ae.field]: ae.message })
      } else {
        setErrors({ root: ae.message ?? 'Sign in failed. Please try again.' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthFormPanel>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-2xl font-bold tracking-tight'>Welcome back</h1>
        <p className='mt-1.5 text-sm text-muted-foreground'>
          Sign in to your account to continue.
        </p>
      </div>

      {/* Reset success banner */}
      {justReset && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400'>
          <svg
            width='15'
            height='15'
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
          Password reset successfully. Please sign in.
        </div>
      )}

      {/* Root error */}
      {errors.root && (
        <div className='mb-6 flex items-center gap-2.5 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
          <IconAlertCircle size={15} className='shrink-0' />
          {errors.root}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className='flex flex-col gap-5'>
        {/* Email */}
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
              clearError('email')
            }}
            aria-invalid={!!errors.email}
            disabled={isLoading}
          />
          {errors.email && (
            <p className='text-xs text-destructive'>{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className='flex flex-col gap-1.5'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='password'>Password</Label>
            <Link
              href='/auth/forgot-password'
              className='text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline'
            >
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id='password'
            placeholder='••••••••'
            autoComplete='current-password'
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              clearError('password')
            }}
            hasError={!!errors.password}
            disabled={isLoading}
          />
          {errors.password && (
            <p className='text-xs text-destructive'>{errors.password}</p>
          )}
        </div>

        <Button
          type='submit'
          size='lg'
          disabled={isLoading}
          className='mt-1 w-full rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90 transition-opacity'
        >
          {isLoading ?
            <>
              <IconLoader2 size={15} className='animate-spin' />
              Signing in…
            </>
          : 'Sign in'}
        </Button>
      </form>
    </AuthFormPanel>
  )
}
