/**
 * Auth API Service
 *
 * Drop-in ready for a real backend — swap the mock blocks for `fetch` calls
 * while keeping identical signatures.  Every function throws an `AuthError`
 * on failure so callers can pattern-match on `error.code`.
 *
 * Real-world env vars you'll need:
 *   NEXT_PUBLIC_API_BASE_URL=https://api.yourapp.com
 */

import type {
  AuthError,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  ResetPasswordPayload,
  ResetPasswordResponse,
  SignInPayload,
  SignInResponse,
  VerifyOtpPayload,
  VerifyOtpResponse
} from '@/types/auth'

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''

// ─── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms))
}

function authError(code: string, message: string, field?: string): AuthError {
  return { code, message, field }
}

/**
 * Generic wrapper you'd use in production:
 *
 * async function request<T>(path: string, init?: RequestInit): Promise<T> {
 *   const res = await fetch(`${BASE_URL}${path}`, {
 *     ...init,
 *     credentials: 'include',
 *     headers: { 'Content-Type': 'application/json', ...init?.headers },
 *   })
 *   if (!res.ok) {
 *     const err = await res.json()
 *     throw authError(err.code ?? 'UNKNOWN', err.message ?? 'Request failed', err.field)
 *   }
 *   return res.json()
 * }
 */

// ─── Auth functions ───────────────────────────────────────────────────────────

/**
 * Sign in with email and password.
 *
 * TODO (real):
 *   return request<SignInResponse>('/auth/sign-in', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   })
 */
export async function signIn(payload: SignInPayload): Promise<SignInResponse> {
  void BASE_URL
  await delay(900)

  // Mock: accepts any valid-format email + any non-empty password
  return {
    user: {
      id: 'usr_admin_001',
      name: 'Admin User',
      email: payload.email,
      role: 'Admin',
      photoUrl: null
    },
    accessToken: 'mock_access_token_abc123',
    refreshToken: 'mock_refresh_token_xyz789'
  }
}

/**
 * Request a password-reset OTP to be sent to `email`.
 *
 * TODO (real):
 *   return request<ForgotPasswordResponse>('/auth/forgot-password', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   })
 */
export async function forgotPassword(
  payload: ForgotPasswordPayload
): Promise<ForgotPasswordResponse> {
  await delay(1000)

  const parts =
    payload.email.includes('@') ?
      payload.email.split('@')
    : ['user', 'example.com']
  const user = parts[0] ?? 'user'
  const domain = parts[1] ?? 'example.com'
  const masked = user.slice(0, 2) + '***@' + domain

  return {
    message: 'OTP sent',
    maskedEmail: masked,
    expiresIn: 300 // 5 min
  }
}

/**
 * Verify the 6-digit OTP and receive a short-lived reset token.
 *
 * TODO (real):
 *   return request<VerifyOtpResponse>('/auth/verify-otp', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   })
 */
export async function verifyOtp(
  payload: VerifyOtpPayload
): Promise<VerifyOtpResponse> {
  await delay(800)
  void payload

  // Mock: accepts any 6-digit code
  return {
    resetToken: `rst_${Date.now()}_mock`,
    expiresIn: 600
  }
}

/**
 * Exchange the reset token for a new password.
 *
 * TODO (real):
 *   return request<ResetPasswordResponse>('/auth/reset-password', {
 *     method: 'POST',
 *     body: JSON.stringify(payload),
 *   })
 */
export async function resetPassword(
  payload: ResetPasswordPayload
): Promise<ResetPasswordResponse> {
  await delay(900)

  // Mock: accept any non-empty token
  if (!payload.token) {
    throw authError(
      'INVALID_TOKEN',
      'Reset session expired. Please start over.'
    )
  }
  if (payload.password !== payload.confirmPassword) {
    throw authError(
      'PASSWORD_MISMATCH',
      'Passwords do not match.',
      'confirmPassword'
    )
  }
  if (payload.password.length < 8) {
    throw authError(
      'WEAK_PASSWORD',
      'Password must be at least 8 characters.',
      'password'
    )
  }

  return { message: 'Password reset successfully.' }
}

/**
 * Sign the current user out.
 *
 * TODO (real):
 *   return request<void>('/auth/sign-out', { method: 'POST' })
 */
export async function signOut(): Promise<void> {
  await delay(300)
  // Clear tokens from storage / cookies as needed
}
