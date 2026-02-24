'use client'

import {
  IconCalendar,
  IconEdit,
  IconMapPin,
  IconTrash,
  IconUser
} from '@tabler/icons-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Event } from '@/types/dashboard'

interface EventCardProps {
  event: Event
  onView: (event: Event) => void
  onEdit: (event: Event) => void
  onDelete: (event: Event) => void
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  }
}

function isUpcoming(iso: string) {
  return new Date(iso) > new Date()
}

export function EventCard({ event, onView, onEdit, onDelete }: EventCardProps) {
  const { date, time } = formatDateTime(event.dateTime)
  const upcoming = isUpcoming(event.dateTime)

  return (
    <div
      className='group relative flex flex-col overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-card text-card-foreground cursor-pointer transition-shadow hover:shadow-lg hover:ring-foreground/20'
      onClick={() => onView(event)}
    >
      {/* ── Hero image ─────────────────────────────────────────────────── */}
      <div className='relative h-44 w-full overflow-hidden bg-muted'>
        <Image
          src={event.images[0]}
          alt={event.name}
          fill
          className='object-cover transition-transform duration-300 group-hover:scale-105'
          sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
          unoptimized
        />
        {/* status badge */}
        <div className='absolute top-3 left-3'>
          <Badge
            variant={upcoming ? 'default' : 'secondary'}
            className='text-[11px]'
          >
            {upcoming ? 'Upcoming' : 'Past'}
          </Badge>
        </div>
        {/* action buttons — appear on hover */}
        <div
          className='absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant='secondary'
            size='icon-sm'
            aria-label='Edit event'
            onClick={() => onEdit(event)}
          >
            <IconEdit className='h-3.5 w-3.5' />
          </Button>
          <Button
            variant='destructive'
            size='icon-sm'
            aria-label='Delete event'
            onClick={() => onDelete(event)}
          >
            <IconTrash className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        <h3 className='font-semibold text-base leading-snug line-clamp-2'>
          {event.name}
        </h3>

        <p className='text-sm text-muted-foreground line-clamp-2'>
          {event.description}
        </p>

        <div className='mt-auto flex flex-col gap-1.5 text-xs text-muted-foreground'>
          <span className='flex items-center gap-1.5'>
            <IconCalendar className='h-3.5 w-3.5 shrink-0' />
            {date} · {time}
          </span>
          <span className='flex items-center gap-1.5'>
            <IconMapPin className='h-3.5 w-3.5 shrink-0' />
            <span className='truncate'>{event.location}</span>
          </span>
        </div>
      </div>

      {/* ── Host footer ───────────────────────────────────────────────── */}
      <div className='border-t px-4 py-3 flex items-center gap-2'>
        {event.host.photo ?
          <Image
            src={event.host.photo}
            alt={event.host.name}
            width={24}
            height={24}
            className='rounded-full object-cover'
            unoptimized
          />
        : <div className='flex h-6 w-6 items-center justify-center rounded-full bg-muted'>
            <IconUser className='h-3 w-3 text-muted-foreground' />
          </div>
        }
        <span className='text-xs text-muted-foreground truncate'>
          Hosted by{' '}
          <span className='font-medium text-foreground'>{event.host.name}</span>
        </span>
      </div>
    </div>
  )
}
