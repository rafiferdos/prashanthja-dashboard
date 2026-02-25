'use client'

import {
  IconCheck,
  IconDeviceFloppy,
  IconFileText,
  IconLock
} from '@tabler/icons-react'
import dynamic from 'next/dynamic'
import { useState } from 'react'
import { sileo } from 'sileo'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const RichTextEditor = dynamic(
  () =>
    import('@/components/content-management/rich-text-editor').then(
      (m) => m.RichTextEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className='flex flex-col overflow-hidden rounded-2xl border ring-1 ring-foreground/5'>
        <div className='flex flex-wrap gap-1 border-b bg-muted/40 px-2 py-1.5'>
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className='h-8 w-8 rounded-md' />
          ))}
        </div>
        <div className='flex flex-col gap-3 px-8 py-6'>
          <Skeleton className='h-8 w-2/3' />
          <Skeleton className='h-4 w-1/4' />
          <Skeleton className='mt-2 h-5 w-1/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-5/6' />
          <Skeleton className='mt-2 h-5 w-1/3' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-4/5' />
        </div>
      </div>
    )
  }
)

// ─── Default content ──────────────────────────────────────────────────────────
const PRIVACY_DEFAULT = [
  { type: 'h1', children: [{ text: 'Privacy Policy' }] },
  {
    type: 'p',
    children: [
      { text: 'Last updated: ' },
      { text: 'February 24, 2026', bold: true }
    ]
  },
  { type: 'h2', children: [{ text: '1. Information We Collect' }] },
  {
    type: 'p',
    children: [
      {
        text: 'We collect information you provide directly to us, such as when you create an account, submit a form, or contact us for support.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '2. How We Use Your Information' }] },
  {
    type: 'p',
    children: [
      {
        text: 'We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '3. Information Sharing' }] },
  {
    type: 'p',
    children: [
      {
        text: 'We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent.'
      }
    ]
  },
  {
    type: 'blockquote',
    children: [
      {
        text: 'Your privacy is important to us. It is our policy to respect your privacy regarding any information we may collect while operating our platform.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '4. Data Security' }] },
  {
    type: 'p',
    children: [
      {
        text: 'We implement appropriate technical and organisational measures to protect the security of your personal information.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '5. Contact Us' }] },
  {
    type: 'p',
    children: [
      { text: 'If you have questions about this policy, contact us at ' },
      { text: 'privacy@example.com', bold: true },
      { text: '.' }
    ]
  }
]

const TERMS_DEFAULT = [
  { type: 'h1', children: [{ text: 'Terms & Conditions' }] },
  {
    type: 'p',
    children: [
      { text: 'Effective: ' },
      { text: 'February 24, 2026', bold: true }
    ]
  },
  { type: 'h2', children: [{ text: '1. Acceptance of Terms' }] },
  {
    type: 'p',
    children: [
      {
        text: 'By accessing and using this platform, you accept and agree to be bound by the terms and provisions of this agreement.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '2. Use License' }] },
  {
    type: 'p',
    children: [
      {
        text: 'Permission is granted to temporarily use this platform for personal, non-commercial transitory viewing only.'
      }
    ]
  },
  {
    type: 'blockquote',
    children: [
      {
        text: 'This licence shall automatically terminate if you violate any of these restrictions and may be terminated by us at any time.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '3. Disclaimer' }] },
  {
    type: 'p',
    children: [
      {
        text: "The materials on this platform are provided on an 'as is' basis. We make no warranties, expressed or implied."
      }
    ]
  },
  { type: 'h2', children: [{ text: '4. Limitations' }] },
  {
    type: 'p',
    children: [
      {
        text: 'In no event shall our company or its suppliers be liable for any damages arising out of the use or inability to use the materials on this platform.'
      }
    ]
  },
  { type: 'h2', children: [{ text: '5. Governing Law' }] },
  {
    type: 'p',
    children: [
      {
        text: 'These terms are governed by and construed in accordance with the laws applicable in your jurisdiction.'
      }
    ]
  }
]

// ─── Single tab content ───────────────────────────────────────────────────────
function EditorTab({
  defaultContent,
  placeholder
}: {
  defaultContent: object[]
  placeholder: string
}) {
  const [saved, setSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    setIsSaving(true)
    try {
      await sileo.promise(
        new Promise<void>((r) => setTimeout(r, 800)),
        {
          loading: { title: 'Saving document…', description: 'Publishing your latest changes.' },
          success: { title: 'Document saved!', description: 'Your changes have been published.' },
          error: { title: 'Save failed', description: 'Something went wrong. Please try again.' }
        }
      )
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='flex flex-col gap-4'>
      <RichTextEditor
        initialContent={defaultContent}
        placeholder={placeholder}
        minHeight='480px'
      />

      <div className='flex items-center justify-between'>
        <p className='text-xs text-muted-foreground'>
          Auto-save is{' '}
          <span className='font-medium text-foreground'>disabled</span> — save
          manually when ready.
        </p>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className='gap-2 min-w-28'
        >
          {saved ?
            <>
              <IconCheck className='size-4' />
              Saved!
            </>
          : isSaving ?
            <>
              <IconDeviceFloppy className='size-4 animate-pulse' />
              Saving…
            </>
          : <>
              <IconDeviceFloppy className='size-4' />
              Save Changes
            </>
          }
        </Button>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContentManagementPage() {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>
          Content Management
        </h1>
        <p className='text-muted-foreground'>
          Edit and publish legal content shown to your platform users.
        </p>
      </div>

      <Tabs defaultValue='privacy'>
        <TabsList>
          <TabsTrigger value='privacy' className='gap-1.5'>
            <IconLock className='size-3.5' />
            Privacy Policy
          </TabsTrigger>
          <TabsTrigger value='terms' className='gap-1.5'>
            <IconFileText className='size-3.5' />
            Terms &amp; Conditions
          </TabsTrigger>
        </TabsList>

        <TabsContent value='privacy' className='mt-4'>
          <EditorTab
            defaultContent={PRIVACY_DEFAULT}
            placeholder='Write your privacy policy…'
          />
        </TabsContent>

        <TabsContent value='terms' className='mt-4'>
          <EditorTab
            defaultContent={TERMS_DEFAULT}
            placeholder='Write your terms and conditions…'
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
