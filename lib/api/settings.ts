/**
 * Settings API Service
 *
 * All functions are ready to be wired to real HTTP endpoints.
 * Replace the mock implementations with actual `fetch` / `axios` calls
 * while keeping the same signatures so consumers don't need to change.
 *
 * Example real implementation:
 *   export async function getProfile(): Promise<ProfileSettings> {
 *     const res = await fetch('/api/profile', { credentials: 'include' })
 *     if (!res.ok) throw new Error(await res.text())
 *     return res.json()
 *   }
 */

import type {
  ApiResponse,
  ProfileSettings,
  UpdateProfilePayload,
  UploadPhotoResponse
} from '@/types/api'

// ─── Mock seed data ────────────────────────────────────────────────────────────

const MOCK_PROFILE: ProfileSettings = {
  id: 'usr_admin_001',
  name: 'Prashanth JA',
  email: 'prashanthja@sparktech.com',
  about:
    'Product manager and admin at SparkTech. Passionate about building great user experiences and data-driven products.',
  photoUrl: null,
  role: 'Admin',
  createdAt: '2024-01-15T09:00:00Z'
}

// In-memory store so edits persist within a session (remove in real impl)
let _profileStore: ProfileSettings = { ...MOCK_PROFILE }

// ─── API functions ─────────────────────────────────────────────────────────────

/** Fetch the current user's profile. */
export async function getProfile(): Promise<ProfileSettings> {
  // TODO: replace with → fetch('/api/profile', { credentials: 'include' })
  await delay(800)
  return { ..._profileStore }
}

/** Update name / email / about / photoUrl. */
export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<ApiResponse<ProfileSettings>> {
  // TODO: replace with →
  //   fetch('/api/profile', {
  //     method: 'PATCH',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify(payload),
  //     credentials: 'include',
  //   })
  await delay(1000)
  _profileStore = { ..._profileStore, ...payload }
  return {
    success: true,
    data: { ..._profileStore },
    message: 'Profile updated.'
  }
}

/**
 * Upload a profile photo and receive a CDN / storage URL back.
 * The returned URL should then be passed inside `updateProfile()`.
 */
export async function uploadProfilePhoto(
  file: File
): Promise<ApiResponse<UploadPhotoResponse>> {
  // TODO: replace with →
  //   const form = new FormData()
  //   form.append('photo', file)
  //   const res = await fetch('/api/profile/photo', {
  //     method: 'POST',
  //     body: form,
  //     credentials: 'include',
  //   })
  //   return res.json()
  void file // replaced by real FormData upload in production
  await delay(600)
  // Mock: return a random picsum avatar so UI shows a real image
  const seed = Math.floor(Math.random() * 100)
  return {
    success: true,
    data: { url: `https://picsum.photos/seed/${seed}/200/200` }
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}
