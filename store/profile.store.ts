/**
 * Profile Store — Zustand v5
 *
 * Not persisted: the profile is loaded on demand from the API and cached here
 * for the duration of the session.  It is cleared on sign-out (see
 * app/dashboard/layout.tsx logout handler).
 */

import { create } from 'zustand'

import type { ProfileSettings } from '@/types/api'

interface ProfileState {
  /** Cached profile data fetched from the API. */
  profile: ProfileSettings | null
  /** True while an API request is in-flight. */
  isLoading: boolean

  // ── Actions ───────────────────────────────────────────────────────────────
  /** Replace the full profile (e.g. after initial load). */
  setProfile: (profile: ProfileSettings) => void
  /** Merge a partial update into the existing profile (e.g. after save). */
  patchProfile: (patch: Partial<ProfileSettings>) => void
  /** Toggle the loading indicator. */
  setLoading: (loading: boolean) => void
  /** Clear profile data — call on sign-out. */
  reset: () => void
}

export const useProfileStore = create<ProfileState>()((set) => ({
  profile: null,
  isLoading: false,

  setProfile: (profile) => set({ profile }),

  patchProfile: (patch) =>
    set((state) =>
      state.profile ? { profile: { ...state.profile, ...patch } } : state
    ),

  setLoading: (isLoading) => set({ isLoading }),

  reset: () => set({ profile: null, isLoading: false })
}))
