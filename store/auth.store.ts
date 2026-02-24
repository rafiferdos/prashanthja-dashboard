/**
 * Auth Store — Zustand v5
 *
 * Persisted to sessionStorage so the session survives page refreshes
 * but clears when the browser tab is closed.
 *
 * In production: also invalidate the server-side session / clear httpOnly
 * cookies inside signOut() after calling the signOut API.
 */

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import type { AuthUser } from '@/types/auth'

interface AuthState {
  /** The currently authenticated user, or null when logged out. */
  user: AuthUser | null
  /** Short-lived access token returned by the sign-in API. */
  accessToken: string | null
  /** Convenience flag derived from user presence. */
  isAuthenticated: boolean

  // ── Actions ────────────────────────────────────────────────────────────────
  /** Call after a successful sign-in API response. */
  setAuth: (user: AuthUser, accessToken: string) => void
  /** Call on logout — clears all auth state. */
  signOut: () => void
  /** Patch individual user fields (e.g. after a profile save). */
  patchUser: (patch: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken) =>
        set({ user, accessToken, isAuthenticated: true }),

      signOut: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      patchUser: (patch) =>
        set((state) =>
          state.user ? { user: { ...state.user, ...patch } } : state
        )
    }),
    {
      name: 'friendzy-auth',
      storage: createJSONStorage(() => {
        // sessionStorage is unavailable during SSR — fall back to a no-op store
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          }
        }
        return sessionStorage
      }),
      // Only persist the data fields, not the action functions
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
