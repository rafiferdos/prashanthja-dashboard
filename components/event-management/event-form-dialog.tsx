'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Event } from '@/types/dashboard'

// ─── API stubs ───────────────────────────────────────────────────────────────
async function apiCreateEvent(data: Omit<Event, 'id'>): Promise<Event> {
  // TODO: replace with: return fetch('/api/events', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json())
  return { ...data, id: `evt_${Date.now()}` }
}

async function apiUpdateEvent(event: Event): Promise<Event> {
  // TODO: replace with: return fetch(`/api/events/${event.id}`, { method: 'PUT', body: JSON.stringify(event) }).then(r => r.json())
  return event
}
// ─────────────────────────────────────────────────────────────────────────────

type FormState = {
  name: string
  description: string
  location: string
  dateTime: string
  images: string // comma-separated URLs
  hostName: string
  hostEmail: string
  hostPhoto: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  location: '',
  dateTime: '',
  images: '',
  hostName: '',
  hostEmail: '',
  hostPhoto: ''
}

function eventToForm(e: Event): FormState {
  return {
    name: e.name,
    description: e.description,
    location: e.location,
    dateTime: new Date(e.dateTime).toISOString().slice(0, 16), // "YYYY-MM-DDTHH:mm"
    images: e.images.join(', '),
    hostName: e.host.name,
    hostEmail: e.host.email,
    hostPhoto: e.host.photo ?? ''
  }
}

function formToEventData(f: FormState): Omit<Event, 'id'> {
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    location: f.location.trim(),
    dateTime: new Date(f.dateTime).toISOString(),
    images: f.images
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    host: {
      name: f.hostName.trim(),
      email: f.hostEmail.trim(),
      photo: f.hostPhoto.trim() || undefined
    }
  }
}

interface EventFormDialogProps {
  /** null = create mode, Event = edit mode */
  event?: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (event: Event) => void
}

export function EventFormDialog({
  event,
  open,
  onOpenChange,
  onSave
}: EventFormDialogProps) {
  const isEdit = !!event
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [isSaving, setIsSaving] = useState(false)

  // Sync form when target event changes
  useEffect(() => {
    setForm(event ? eventToForm(event) : EMPTY_FORM)
  }, [event])

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name || !form.dateTime || !form.hostName || !form.hostEmail)
      return
    setIsSaving(true)
    try {
      const data = formToEventData(form)
      const saved =
        isEdit ?
          await apiUpdateEvent({ ...data, id: event!.id })
        : await apiCreateEvent(data)
      onSave(saved)
      onOpenChange(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-lg max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>

        <div className='grid gap-5'>
          {/* Basic info */}
          <div className='grid gap-2'>
            <Label htmlFor='ev-name'>Event Name *</Label>
            <Input
              id='ev-name'
              placeholder='Global Tech Summit 2026'
              value={form.name}
              onChange={set('name')}
            />
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='ev-desc'>Description</Label>
            <Textarea
              id='ev-desc'
              placeholder='Describe your event…'
              rows={3}
              value={form.description}
              onChange={set('description')}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='ev-dt'>Date & Time *</Label>
              <Input
                id='ev-dt'
                type='datetime-local'
                value={form.dateTime}
                onChange={set('dateTime')}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='ev-loc'>Location</Label>
              <Input
                id='ev-loc'
                placeholder='San Francisco, CA'
                value={form.location}
                onChange={set('location')}
              />
            </div>
          </div>

          <div className='grid gap-2'>
            <Label htmlFor='ev-imgs'>
              Image URLs
              <span className='ml-1 text-xs text-muted-foreground'>
                (comma-separated)
              </span>
            </Label>
            <Textarea
              id='ev-imgs'
              placeholder='https://example.com/img1.jpg, https://example.com/img2.jpg'
              rows={2}
              value={form.images}
              onChange={set('images')}
            />
          </div>

          {/* Host info */}
          <div className='border-t pt-4'>
            <p className='text-sm font-medium mb-3'>Event Host</p>
            <div className='grid gap-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='ev-hname'>Host Name *</Label>
                  <Input
                    id='ev-hname'
                    placeholder='Jane Doe'
                    value={form.hostName}
                    onChange={set('hostName')}
                  />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='ev-hemail'>Host Email *</Label>
                  <Input
                    id='ev-hemail'
                    type='email'
                    placeholder='jane@example.com'
                    value={form.hostEmail}
                    onChange={set('hostEmail')}
                  />
                </div>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='ev-hphoto'>
                  Host Photo URL
                  <span className='ml-1 text-xs text-muted-foreground'>
                    (optional)
                  </span>
                </Label>
                <Input
                  id='ev-hphoto'
                  placeholder='https://example.com/avatar.jpg'
                  value={form.hostPhoto}
                  onChange={set('hostPhoto')}
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant='outline' onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ?
              'Saving…'
            : isEdit ?
              'Save Changes'
            : 'Create Event'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
