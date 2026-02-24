'use client'

import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconMail,
  IconMapPin,
  IconUser
} from '@tabler/icons-react'
import Image from 'next/image'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Event } from '@/types/dashboard'

interface EventDetailDialogProps {
  event: Event | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function EventDetailDialog({
  event,
  open,
  onOpenChange
}: EventDetailDialogProps) {
  const [imgIndex, setImgIndex] = useState(0)

  if (!event) return null

  const images = event.images
  const hasMultiple = images.length > 1

  function prev(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIndex((i) => (i - 1 + images.length) % images.length)
  }
  function next(e: React.MouseEvent) {
    e.stopPropagation()
    setImgIndex((i) => (i + 1) % images.length)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v)
        setImgIndex(0)
      }}
    >
      <DialogContent
        className='
          max-w-lg p-0 overflow-hidden border-0
          bg-background/80 backdrop-blur-2xl backdrop-saturate-150
          ring-1 ring-foreground/8
          shadow-[0_32px_80px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]
          duration-300!
        '
        showCloseButton={false}
      >
        {/* Image carousel */}
        <div className='relative h-52 w-full bg-muted'>
          <Image
            src={images[imgIndex]}
            alt={`${event.name} image ${imgIndex + 1}`}
            fill
            className='object-cover'
            sizes='512px'
            unoptimized
          />
          {/* upcoming badge */}
          <div className='absolute top-3 left-3'>
            <Badge
              variant={
                new Date(event.dateTime) > new Date() ? 'default' : 'secondary'
              }
            >
              {new Date(event.dateTime) > new Date() ? 'Upcoming' : 'Past'}
            </Badge>
          </div>
          {hasMultiple && (
            <>
              <button
                onClick={prev}
                className='absolute left-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition'
              >
                <IconChevronLeft className='h-4 w-4' />
              </button>
              <button
                onClick={next}
                className='absolute right-2 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition'
              >
                <IconChevronRight className='h-4 w-4' />
              </button>
              {/* dots */}
              <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1'>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      setImgIndex(i)
                    }}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${i === imgIndex ? 'bg-white w-3' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Body */}
        <div className='flex flex-col gap-4 p-6'>
          <DialogHeader>
            <DialogTitle className='text-xl leading-snug'>
              {event.name}
            </DialogTitle>
          </DialogHeader>

          <p className='text-sm text-muted-foreground leading-relaxed'>
            {event.description}
          </p>

          <div className='flex flex-col gap-2 text-sm'>
            <span className='flex items-center gap-2'>
              <IconCalendar className='h-4 w-4 text-muted-foreground shrink-0' />
              {formatDateTime(event.dateTime)}
            </span>
            <span className='flex items-center gap-2'>
              <IconMapPin className='h-4 w-4 text-muted-foreground shrink-0' />
              {event.location}
            </span>
          </div>

          <Separator />

          {/* Host */}
          <div className='flex items-center gap-3'>
            {event.host.photo ?
              <Image
                src={event.host.photo}
                alt={event.host.name}
                width={40}
                height={40}
                className='rounded-full object-cover ring-1 ring-foreground/10'
                unoptimized
              />
            : <div className='flex h-10 w-10 items-center justify-center rounded-full bg-muted'>
                <IconUser className='h-5 w-5 text-muted-foreground' />
              </div>
            }
            <div className='flex flex-col gap-0.5'>
              <span className='text-sm font-medium'>{event.host.name}</span>
              <span className='flex items-center gap-1 text-xs text-muted-foreground'>
                <IconMail className='h-3 w-3' />
                {event.host.email}
              </span>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
