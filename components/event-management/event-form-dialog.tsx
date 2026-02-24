'use client'

import { IconCalendar } from '@tabler/icons-react'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
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
  date: Date | undefined
  time: string
  images: string // comma-separated URLs
  hostName: string
  hostEmail: string
  hostPhoto: string
}

const EMPTY_FORM: FormState = {
  name: '',
  description: '',
  location: '',
  date: undefined,
  time: '',
  images: '',
  hostName: '',
  hostEmail: '',
  hostPhoto: ''
}

function eventToForm(e: Event): FormState {
  const d = new Date(e.dateTime)
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return {
    name: e.name,
    description: e.description,
    location: e.location,
    date: d,
    time: `${hh}:${mm}`,
    images: e.images.join(', '),
    hostName: e.host.name,
    hostEmail: e.host.email,
    hostPhoto: e.host.photo ?? ''
  }
}

function formToEventData(f: FormState): Omit<Event, 'id'> {
  const combined = new Date(f.date!)
  if (f.time) {
    const [hours, minutes] = f.time.split(':').map(Number)
    combined.setHours(hours, minutes, 0, 0)
  }
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    location: f.location.trim(),
    dateTime: combined.toISOString(),
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
  const [calOpen, setCalOpen] = useState(false)

  // Sync form when target event changes
  useEffect(() => {
    setForm(event ? eventToForm(event) : EMPTY_FORM)
  }, [event])

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSave() {
    if (!form.name || !form.date || !form.hostName || !form.hostEmail) return
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
              <Label>Date *</Label>
              <Popover open={calOpen} onOpenChange={setCalOpen}>
                <PopoverTrigger
                  render={
                    <button
                      type='button'
                      className={cn(
                        'flex h-9 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow]',
                        'hover:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                        !form.date && 'text-muted-foreground'
                      )}
                    />
                  }
                >
                  <IconCalendar className='size-4 shrink-0' />
                  <span className='truncate'>
                    {form.date ? format(form.date, 'PPP') : 'Pick a date'}
                  </span>
                </PopoverTrigger>
                <PopoverContent align='start' className='w-auto p-0'>
                  <Calendar
                    mode='single'
                    selected={form.date}
                    onSelect={(d) => {
                      setForm((prev) => ({ ...prev, date: d }))
                      setCalOpen(false)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className='grid gap-1'>
                <Label
                  htmlFor='ev-time'
                  className='text-xs text-muted-foreground'
                >
                  Time
                </Label>
                <Input
                  id='ev-time'
                  type='time'
                  value={form.time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
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
