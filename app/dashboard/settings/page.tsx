'use client'

import {
  IconAlertTriangle,
  IconCamera,
  IconCheck,
  IconId,
  IconLoader2,
  IconLock,
  IconMail,
  IconShield,
  IconUser
} from '@tabler/icons-react'
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
    <div className='flex w-full flex-col rounded-2xl border bg-card shadow-sm'>
      {/* banner */}
      <div className='relative'>
        <Skeleton className='h-32 w-full rounded-t-2xl' />
        <div className='absolute bottom-0 left-6 translate-y-1/2'>
          <Skeleton className='size-[96px] rounded-full ring-4 ring-card' />
        </div>
      </div>
      {/* header */}
      <div className='flex items-start justify-between px-6 pb-5 pt-14'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-6 w-36 rounded-lg' />
          <Skeleton className='h-4 w-56 rounded-full' />
        </div>
        <div className='flex flex-col items-end gap-1.5 pt-1'>
          <Skeleton className='h-5 w-32 rounded-lg' />
          <Skeleton className='h-3 w-44 rounded-lg' />
        </div>
      </div>
      <Separator />
      {/* sections */}
      {[1, 2, 3].map((i) => (
        <div key={i} className='grid gap-8 px-6 py-8 xl:grid-cols-[280px_1fr]'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='size-9 rounded-xl' />
            <Skeleton className='mt-2 h-5 w-32 rounded-lg' />
            <Skeleton className='h-4 w-48 rounded-lg' />
          </div>
          <div className='flex flex-col gap-4'>
            <Skeleton className='h-9 w-full rounded-full' />
            <Skeleton className='h-9 w-full rounded-full' />
          </div>
        </div>
      ))}
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

// ─── Section ──────────────────────────────────────────────────────────────────

interface SectionProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  title: string
  description: string
  children: React.ReactNode
}

function Section({ icon: Icon, title, description, children }: SectionProps) {
  return (
    <div className='grid gap-8 px-6 py-8 xl:grid-cols-[280px_1fr]'>
      {/* Left: label column */}
      <div className='flex flex-col gap-2'>
        <div className='flex size-9 items-center justify-center rounded-xl bg-primary/10'>
          <Icon size={16} className='text-primary' />
        </div>
        <h2 className='mt-1 text-sm font-semibold leading-snug'>{title}</h2>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          {description}
        </p>
      </div>
      {/* Right: content */}
      <div>{children}</div>
    </div>
  )
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
        storeSetProfile(data)
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
      if (pendingPhotoFile) {
        setIsUploadingPhoto(true)
        const uploadRes = await uploadProfilePhoto(pendingPhotoFile)
        setIsUploadingPhoto(false)
        if (uploadRes.success && uploadRes.data) {
          resolvedPhotoUrl = uploadRes.data.url
        }
      } else if (photoPreview === null) {
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
        storeSetProfile(res.data)
        patchUser({ name: res.data.name, photoUrl: res.data.photoUrl })
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

  const handleDiscard = useCallback(() => {
    if (!profile) return
    setName(profile.name)
    setEmail(profile.email)
    setAbout(profile.about)
    setPhotoPreview(profile.photoUrl)
    setPendingPhotoFile(null)
    setSaveStatus('idle')
  }, [profile])

  // ── Dirty check ─────────────────────────────────────────────────────────────
  const isDirty =
    !!profile &&
    (name.trim() !== profile.name ||
      email.trim() !== profile.email ||
      about.trim() !== profile.about ||
      pendingPhotoFile !== null ||
      (photoPreview === null && profile.photoUrl !== null))

  if (isLoading) return <SettingsSkeleton />

  const displayPhoto = photoPreview
  const initials = getInitials(name || 'User')
  const memberSince =
    profile?.createdAt ?
      new Date(profile.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      })
    : '—'

  return (
    <div className='flex w-full flex-col rounded-2xl border bg-card shadow-sm'>
      {/* ── Banner + avatar ──────────────────────────────────────────────── */}
      {/* Wrapper is relative so avatar can hang below banner via translate-y-1/2 */}
      <div className='relative'>
        {/* Banner — self-contained gradient with decorative circles */}
        <div className='h-36 overflow-hidden rounded-t-2xl bg-linear-to-r from-[#0a3444] via-[#1F889E] to-[#20B482] relative'>
          <div className='absolute -right-16 -top-16 size-80 rounded-full bg-white/[0.07]' />
          <div className='absolute -bottom-14 right-52 size-56 rounded-full bg-white/[0.04]' />
          <div className='absolute -left-10 -bottom-10 size-52 rounded-full bg-white/[0.06]' />
          <div className='absolute left-[38%] -top-8 size-36 rounded-full bg-white/[0.04]' />
        </div>

        {/* Avatar — absolutely placed on the bottom edge, half in banner half below */}
        <div className='absolute bottom-0 left-6 translate-y-1/2 z-10'>
          <div className='size-[96px] overflow-hidden rounded-full shadow-2xl ring-4 ring-card'>
            {displayPhoto ?
              <Image
                src={displayPhoto}
                alt={name}
                width={96}
                height={96}
                className='h-full w-full object-cover'
                unoptimized
              />
            : <div className='flex h-full w-full items-center justify-center bg-linear-to-br from-[#1F889E] to-[#20B482] text-2xl font-bold tracking-tight text-white select-none'>
                {initials}
              </div>
            }
          </div>
          <button
            type='button'
            onClick={() => fileInputRef.current?.click()}
            className='absolute bottom-0.5 right-0.5 flex size-8 cursor-pointer items-center justify-center rounded-full border-[3px] border-card bg-linear-to-br from-[#1F889E] to-[#20B482] text-white shadow-lg transition-opacity hover:opacity-80'
            aria-label='Upload photo'
          >
            <IconCamera size={14} />
          </button>
          <input
            ref={fileInputRef}
            type='file'
            accept='image/png, image/jpeg, image/webp'
            className='hidden'
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* ── Profile info row — top padding clears the half-avatar (96/2 = 48px + 16px gap) */}
      <div className='flex flex-wrap items-start justify-between gap-3 px-6 pb-5 pt-16'>
        {/* Name + badges */}
        <div className='flex flex-col gap-1.5'>
          <span className='text-xl font-bold leading-tight tracking-tight'>
            {name || 'Your Name'}
          </span>
          <div className='flex flex-wrap items-center gap-2'>
            <span className='rounded-full bg-primary/10 px-3 py-0.5 text-xs font-semibold text-primary'>
              {profile?.role ?? 'Admin'}
            </span>
            <span className='text-xs text-muted-foreground'>
              Active since {memberSince}
            </span>
          </div>
        </div>
        {/* Page label */}
        <div className='flex flex-col items-end gap-0.5'>
          <h1 className='text-base font-bold tracking-tight'>
            Profile Settings
          </h1>
          <p className='text-xs text-muted-foreground'>
            Manage your public profile and account
          </p>
        </div>
      </div>

      <Separator />

      {/* ── Photo section ───────────────────────────────────────────────── */}
      <Section
        icon={IconCamera}
        title='Profile Photo'
        description='Upload a clear photo so your teammates and customers can recognise you.'
      >
        <div className='flex flex-wrap items-center gap-3'>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full'
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingPhoto}
          >
            <IconCamera size={14} className='mr-1.5' />
            {isUploadingPhoto ? 'Uploading…' : 'Upload new photo'}
          </Button>
          {displayPhoto && (
            <Button
              variant='ghost'
              size='sm'
              className='rounded-full text-destructive hover:text-destructive'
              onClick={handleRemovePhoto}
              disabled={isSaving}
            >
              Remove photo
            </Button>
          )}
          <span className='text-xs text-muted-foreground'>
            PNG, JPG or WebP · Max 5 MB
          </span>
        </div>
      </Section>

      <Separator />

      {/* ── Personal information ────────────────────────────────────────── */}
      <Section
        icon={IconUser}
        title='Personal Information'
        description='Update your display name, email address and short bio.'
      >
        <div className='flex flex-col gap-5'>
          {/* Name + Email 2-col */}
          <div className='grid gap-4 sm:grid-cols-2'>
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
            <div className='flex flex-col gap-1.5'>
              <Label htmlFor='email'>
                <span className='flex items-center gap-1.5'>
                  <IconMail size={13} className='text-muted-foreground' />
                  Email Address
                </span>
              </Label>
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
          </div>

          {/* About */}
          <div className='flex flex-col gap-1.5'>
            <Label htmlFor='about'>About</Label>
            <Textarea
              id='about'
              placeholder='Write a short bio about yourself…'
              value={about}
              rows={4}
              maxLength={500}
              onChange={(e) => {
                setAbout(e.target.value)
                setSaveStatus('idle')
              }}
              className='resize-none'
            />
            <p
              className={`text-xs ${about.length > 480 ? 'text-amber-500' : 'text-muted-foreground'}`}
            >
              {about.length} / 500 characters
            </p>
          </div>

          {/* Save bar */}
          <div className='flex items-center justify-between gap-3 rounded-xl border bg-muted/40 px-4 py-3'>
              <span
                className={`text-sm ${
                  saveStatus === 'saved' ?
                    'flex items-center gap-1.5 text-emerald-600'
                  : saveStatus === 'error' ? 'text-destructive'
                  : isDirty ? 'text-muted-foreground'
                  : 'text-muted-foreground/40'
                }`}
              >
                {saveStatus === 'saved' && <IconCheck size={14} />}
                {saveStatus === 'saved' && 'Changes saved successfully'}
                {saveStatus === 'error' && 'Something went wrong. Try again.'}
                {saveStatus === 'idle' && isDirty && 'You have unsaved changes'}
                {saveStatus === 'idle' && !isDirty && 'All changes saved'}
              </span>
              <div className='flex gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  className='rounded-full'
                  disabled={!isDirty || isSaving}
                  onClick={handleDiscard}
                >
                  Discard
                </Button>
                <Button
                  size='sm'
                  className='rounded-full bg-linear-to-r from-[#1F889E] to-[#20B482] text-white hover:opacity-90'
                  disabled={!isDirty || isSaving}
                  onClick={handleSave}
                >
                  {isSaving ?
                    <>
                      <IconLoader2 size={13} className='mr-1.5 animate-spin' />
                      {isUploadingPhoto ? 'Uploading…' : 'Saving…'}
                    </>
                  : 'Save Changes'}
                </Button>
              </div>
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Account & Security ──────────────────────────────────────────── */}
      <Section
        icon={IconShield}
        title='Account & Security'
        description='Read-only account identifiers and security information.'
      >
        <div className='grid gap-3 sm:grid-cols-3'>
          {/* Account ID */}
          <div className='flex flex-col gap-1 rounded-xl border bg-muted/30 px-4 py-3'>
            <span className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
              <IconId size={11} /> Account ID
            </span>
            <span className='truncate font-mono text-sm font-medium'>
              {profile?.id ?? '—'}
            </span>
          </div>
          {/* Role */}
          <div className='flex flex-col gap-1 rounded-xl border bg-muted/30 px-4 py-3'>
            <span className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
              <IconLock size={11} /> Role
            </span>
            <span className='text-sm font-medium capitalize'>
              {profile?.role ?? '—'}
            </span>
          </div>
          {/* Active since */}
          <div className='flex flex-col gap-1 rounded-xl border bg-muted/30 px-4 py-3'>
            <span className='flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground'>
              <IconShield size={11} /> Active Since
            </span>
            <span className='text-sm font-medium'>{memberSince}</span>
          </div>
        </div>
      </Section>

      <Separator />

      {/* ── Danger Zone ─────────────────────────────────────────────────── */}
      <Section
        icon={IconAlertTriangle}
        title='Danger Zone'
        description='Irreversible actions. Proceed with caution.'
      >
        <div className='rounded-xl border border-destructive/25 bg-destructive/5 p-4'>
          <div className='flex flex-wrap items-start justify-between gap-4'>
            <div>
              <p className='text-sm font-semibold text-destructive'>
                Delete Account
              </p>
              <p className='mt-0.5 text-xs text-muted-foreground'>
                Permanently remove your account and all associated data. This
                cannot be undone.
              </p>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='rounded-full border-destructive/40 text-destructive hover:bg-destructive hover:text-destructive-foreground'
            >
              <IconAlertTriangle size={13} className='mr-1.5' />
              Delete Account
            </Button>
          </div>
        </div>
      </Section>
    </div>
  )
}
