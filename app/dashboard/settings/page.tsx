'use client'

import { IconCamera, IconLoader2, IconUser } from '@tabler/icons-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  getProfile,
  updateProfile,
  uploadProfilePhoto
} from '@/lib/api/settings'
import { useAuthStore } from '@/store/auth.store'
import { useProfileStore } from '@/store/profile.store'
import type { ProfileSettings } from '@/types/api'

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SettingsSkeleton() {
  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
      <div>
        <Skeleton className='h-8 w-48 rounded-lg' />
        <Skeleton className='mt-2 h-4 w-72 rounded-lg' />
      </div>
      <div className='grid gap-6 lg:grid-cols-[280px_1fr]'>
        {/* photo card skeleton */}
        <div className='rounded-2xl border bg-card p-6'>
          <Skeleton className='mx-auto size-32 rounded-full' />
          <Skeleton className='mx-auto mt-4 h-9 w-36 rounded-full' />
          <Skeleton className='mx-auto mt-2 h-4 w-48 rounded-lg' />
        </div>
        {/* info card skeleton */}
        <div className='flex flex-col gap-5 rounded-2xl border bg-card p-6'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='flex flex-col gap-1.5'>
              <Skeleton className='h-4 w-16 rounded-lg' />
              <Skeleton className='h-9 w-full rounded-full' />
            </div>
          ))}
          <div className='flex flex-col gap-1.5'>
            <Skeleton className='h-4 w-16 rounded-lg' />
            <Skeleton className='h-28 w-full rounded-xl' />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const storeProfile = useProfileStore((s) => s.profile)
  const storeSetProfile = useProfileStore((s) => s.setProfile)
  const patchUser = useAuthStore((s) => s.patchUser)

  const [profile, setProfile] = useState<ProfileSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // form state (editable copy)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [about, setAbout] = useState('')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null)

  // action states
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>(
    'idle'
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Load profile ────────────────────────────────────────────────────────────
  useEffect(() => {
    // If we already have a cached profile in the store, use it immediately
    if (storeProfile) {
      setProfile(storeProfile)
      setName(storeProfile.name)
      setEmail(storeProfile.email)
      setAbout(storeProfile.about)
      setPhotoPreview(storeProfile.photoUrl)
      setIsLoading(false)
      return
    }

    getProfile()
      .then((data) => {
        setProfile(data)
        storeSetProfile(data) // cache in store
        setName(data.name)
        setEmail(data.email)
        setAbout(data.about)
        setPhotoPreview(data.photoUrl)
      })
      .finally(() => setIsLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Photo selection ─────────────────────────────────────────────────────────
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      setPendingPhotoFile(file)
      const reader = new FileReader()
      reader.onload = (ev) => setPhotoPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    },
    []
  )

  const handleRemovePhoto = useCallback(() => {
    setPhotoPreview(null)
    setPendingPhotoFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!profile) return
    setIsSaving(true)
    setSaveStatus('idle')

    try {
      let resolvedPhotoUrl = profile.photoUrl

      // Upload new photo first if one was picked
      if (pendingPhotoFile) {
        setIsUploadingPhoto(true)
        const uploadRes = await uploadProfilePhoto(pendingPhotoFile)
        setIsUploadingPhoto(false)
        if (uploadRes.success && uploadRes.data) {
          resolvedPhotoUrl = uploadRes.data.url
        }
      } else if (photoPreview === null) {
        // User explicitly removed photo
        resolvedPhotoUrl = null
      }

      const res = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        about: about.trim(),
        photoUrl: resolvedPhotoUrl
      })

      if (res.success && res.data) {
        setProfile(res.data)
        storeSetProfile(res.data) // sync full profile to store
        patchUser({
          // keep topbar name / avatar in sync
          name: res.data.name,
          photoUrl: res.data.photoUrl
        })
        setPhotoPreview(res.data.photoUrl)
        setPendingPhotoFile(null)
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    } finally {
      setIsSaving(false)
      setIsUploadingPhoto(false)
    }
  }, [profile, name, email, about, photoPreview, pendingPhotoFile])

  // ── Dirty check ─────────────────────────────────────────────────────────────
  const isDirty =
    !!profile &&
    (name.trim() !== profile.name ||
      email.trim() !== profile.email ||
      about.trim() !== profile.about ||
      pendingPhotoFile !== null ||
      (photoPreview === null && profile.photoUrl !== null))

  // ────────────────────────────────────────────────────────────────────────────

  if (isLoading) return <SettingsSkeleton />

  const displayPhoto = photoPreview
  const initials = getInitials(name || 'User')

  return (
    <div className='mx-auto flex w-full max-w-4xl flex-col gap-6'>
      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div>
        <h1 className='text-2xl font-bold tracking-tight'>Profile Settings</h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Manage your public profile and account details.
        </p>
      </div>

      <div className='grid gap-6 lg:grid-cols-[280px_1fr]'>
        {/* ── Photo card ────────────────────────────────────────────────── */}
        <div className='flex flex-col items-center gap-4 rounded-2xl border bg-card p-6 shadow-sm'>
          <p className='self-start text-sm font-semibold'>Profile Photo</p>

          {/* Avatar */}
          <div className='relative'>
            <div
              className='
                size-32 overflow-hidden rounded-full ring-4
                ring-background shadow-md
              '
            >
              {displayPhoto ?
                <Image
                  src={displayPhoto}
                  alt={name}
                  width={128}
                  height={128}
                  className='h-full w-full object-cover'
                  unoptimized
                />
              : <div
                  className='
                    flex h-full w-full items-center justify-center
                    bg-linear-to-br from-[#1F889E] to-[#20B482]
                    text-2xl font-bold text-white
                  '
                >
                  {initials}
                </div>
              }
            </div>

            {/* Camera badge */}
            <button
              type='button'
              onClick={() => fileInputRef.current?.click()}
              className='
                absolute bottom-0 right-0 flex size-9 cursor-pointer items-center justify-center
                rounded-full border-2 border-background
                bg-linear-to-br from-[#1F889E] to-[#20B482] text-white shadow-md
                transition-opacity hover:opacity-90
              '
              aria-label='Upload photo'
            >
              <IconCamera size={16} />
            </button>

            <input
              ref={fileInputRef}
              type='file'
              accept='image/png, image/jpeg, image/webp'
              className='hidden'
              onChange={handleFileChange}
            />
          </div>

          {/* Buttons */}
          <div className='flex w-full flex-col gap-2'>
            <Button
              variant='outline'
              size='sm'
              className='w-full rounded-full'
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
            >
              <IconUser size={14} className='mr-1.5' />
              {isUploadingPhoto ? 'Uploading…' : 'Upload new photo'}
            </Button>

            {displayPhoto && (
              <Button
                variant='ghost'
                size='sm'
                className='w-full rounded-full text-destructive hover:text-destructive'
                onClick={handleRemovePhoto}
                disabled={isSaving}
              >
                Remove photo
              </Button>
            )}
          </div>

          <p className='text-center text-xs text-muted-foreground'>
            PNG, JPG or WebP. Max 5 MB.
          </p>

          <Separator className='w-full' />

          {/* Read-only account info */}
          <div className='w-full space-y-2 text-sm'>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Role</span>
              <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
                {profile?.role}
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span className='text-muted-foreground'>Member since</span>
              <span className='font-medium'>
                {profile?.createdAt ?
                  new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short'
                  })
                : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* ── Info card ─────────────────────────────────────────────────── */}
        <div className='flex flex-col gap-5 rounded-2xl border bg-card p-6 shadow-sm'>
          <p className='text-sm font-semibold'>Profile Information</p>

          {/* Name */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='name'>Full Name</Label>
            <Input
              id='name'
              placeholder='Your full name'
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setSaveStatus('idle')
              }}
            />
          </div>

          {/* Email */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='email'>Email Address</Label>
            <Input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setSaveStatus('idle')
              }}
            />
          </div>

          {/* About */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='about'>About</Label>
            <Textarea
              id='about'
              placeholder='Write a short bio about yourself…'
              value={about}
              rows={5}
              onChange={(e) => {
                setAbout(e.target.value)
                setSaveStatus('idle')
              }}
              className='resize-none'
            />
            <p className='text-xs text-muted-foreground'>
              {about.length} / 500 characters
            </p>
          </div>

          <Separator />

          {/* Actions */}
          <div className='flex items-center justify-between gap-3'>
            {/* Feedback */}
            <span
              className={`
                text-sm transition-opacity duration-300
                ${saveStatus === 'saved' ? 'text-emerald-500 opacity-100' : ''}
                ${saveStatus === 'error' ? 'text-destructive opacity-100' : ''}
                ${saveStatus === 'idle' ? 'opacity-0' : ''}
              `}
            >
              {saveStatus === 'saved' && '✓ Changes saved successfully.'}
              {saveStatus === 'error' && '✗ Something went wrong. Try again.'}
            </span>

            <div className='ml-auto flex gap-2'>
              <Button
                variant='outline'
                className='rounded-full'
                disabled={!isDirty || isSaving}
                onClick={() => {
                  if (!profile) return
                  setName(profile.name)
                  setEmail(profile.email)
                  setAbout(profile.about)
                  setPhotoPreview(profile.photoUrl)
                  setPendingPhotoFile(null)
                  setSaveStatus('idle')
                }}
              >
                Discard
              </Button>

              <Button
                className='rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90'
                disabled={!isDirty || isSaving}
                onClick={handleSave}
              >
                {isSaving ?
                  <>
                    <IconLoader2 size={14} className='mr-1.5 animate-spin' />
                    {isUploadingPhoto ? 'Uploading…' : 'Saving…'}
                  </>
                : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
