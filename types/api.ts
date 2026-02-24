// ─── Generic API shapes ───────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// ─── Profile / Settings ───────────────────────────────────────────────────────

export interface ProfileSettings {
  id: string
  name: string
  email: string
  about: string
  photoUrl: string | null
  role: string
  createdAt: string
}

export interface UpdateProfilePayload {
  name: string
  email: string
  about: string
  photoUrl?: string | null
}

export interface UploadPhotoResponse {
  url: string
}
