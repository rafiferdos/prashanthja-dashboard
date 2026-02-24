// ─── Request payloads ─────────────────────────────────────────────────────────

export interface SignInPayload {
  email: string
  password: string
}

export interface ForgotPasswordPayload {
  email: string
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface ResetPasswordPayload {
  token: string
  password: string
  confirmPassword: string
}

// ─── Responses ────────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  photoUrl: string | null
}

export interface SignInResponse {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

export interface ForgotPasswordResponse {
  message: string
  /** Masked email shown to user e.g. "a***@example.com" */
  maskedEmail: string
  /** Expiry in seconds */
  expiresIn: number
}

export interface VerifyOtpResponse {
  /** Short-lived token used to authorize the password reset */
  resetToken: string
  /** Expiry in seconds */
  expiresIn: number
}

export interface ResetPasswordResponse {
  message: string
}

// ─── API error shape ──────────────────────────────────────────────────────────

export interface AuthError {
  code: string
  message: string
  field?: string
}
