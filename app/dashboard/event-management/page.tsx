'use client'

import { useEffect, useState } from 'react'

import { EventsGrid } from '@/components/event-management/events-grid'
import { MOCK_EVENTS } from '@/lib/mock-data'

export default function EventManagementPage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Event Management</h1>
        <p className='text-muted-foreground'>
          Create, manage, and track all your platform events.
        </p>
      </div>

      <EventsGrid initialEvents={MOCK_EVENTS} isLoading={isLoading} />
    </div>
  )
}
