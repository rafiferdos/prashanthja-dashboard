'use client'

import { IconPlus } from '@tabler/icons-react'
import { useState } from 'react'

import { EventCard } from '@/components/event-management/event-card'
import { EventCardSkeleton } from '@/components/event-management/event-card-skeleton'
import { EventDetailDialog } from '@/components/event-management/event-detail-dialog'
import { EventFormDialog } from '@/components/event-management/event-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import { Event } from '@/types/dashboard'
import { sileo } from 'sileo'

// ─── API stubs ───────────────────────────────────────────────────────────────
async function apiDeleteEvent(id: string): Promise<void> {
  // TODO: replace with: await fetch(`/api/events/${id}`, { method: 'DELETE' })
  void id
}
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10
const SKELETON_COUNT = 10

interface EventsGridProps {
  initialEvents: Event[]
  isLoading?: boolean
}

function buildPageNumbers(
  page: number,
  totalPages: number
): (number | 'ellipsis')[] {
  if (totalPages <= 7)
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  const pages: (number | 'ellipsis')[] = [1]
  if (page > 3) pages.push('ellipsis')
  for (
    let i = Math.max(2, page - 1);
    i <= Math.min(totalPages - 1, page + 1);
    i++
  ) {
    pages.push(i)
  }
  if (page < totalPages - 2) pages.push('ellipsis')
  pages.push(totalPages)
  return pages
}

export function EventsGrid({
  initialEvents,
  isLoading = false
}: EventsGridProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [page, setPage] = useState(1)

  // ── dialog state ──
  const [viewTarget, setViewTarget] = useState<Event | null>(null)
  const [editTarget, setEditTarget] = useState<Event | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // ── pagination ──
  const totalPages = Math.ceil(events.length / PAGE_SIZE)
  const paginatedEvents = events.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── handlers ──
  function handleSave(saved: Event) {
    const isNew = !events.some((e) => e.id === saved.id)
    setEvents((prev) => {
      const exists = prev.some((e) => e.id === saved.id)
      if (exists) return prev.map((e) => (e.id === saved.id ? saved : e))
      return [saved, ...prev]
    })
    setEditTarget(null)
    sileo.success({
      title: isNew ? 'Event created!' : 'Event updated',
      description: isNew ? `"${saved.name}" has been added.` : `"${saved.name}" has been saved.`
    })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    const name = deleteTarget.name
    await sileo.promise(
      apiDeleteEvent(deleteTarget.id),
      {
        loading: { title: 'Deleting event…', description: `Removing "${name}".` },
        success: { title: 'Event deleted', description: `"${name}" has been permanently removed.` },
        error: { title: 'Delete failed', description: 'Something went wrong. Please try again.' }
      }
    )
    setEvents((prev) => prev.filter((e) => e.id !== deleteTarget.id))
    setDeleteTarget(null)
    if (paginatedEvents.length === 1 && page > 1) setPage((p) => p - 1)
  }

  if (isLoading) {
    return (
      <>
        {/* ── Toolbar skeleton ─────────────────────────────────────────── */}
        <div className='flex items-center justify-between'>
          <div className='h-4 w-24 rounded-md bg-muted animate-pulse' />
          <div className='h-9 w-32 rounded-xl bg-muted animate-pulse' />
        </div>

        {/* ── Card grid skeleton ───────────────────────────────────────── */}
        <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>

        {/* ── Pagination skeleton ──────────────────────────────────────── */}
        <div className='flex items-center justify-between'>
          <div className='h-4 w-40 rounded-md bg-muted animate-pulse' />
          <div className='flex gap-1'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='h-9 w-9 rounded-xl bg-muted animate-pulse'
              />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {/* ── Toolbar ──────────────────────────────────────────────────────── */}
      <div className='flex items-center justify-between'>
        <p className='text-sm text-muted-foreground'>
          {events.length} events total
        </p>
        <Button onClick={() => setShowCreateForm(true)}>
          <IconPlus className='h-4 w-4' />
          New Event
        </Button>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {paginatedEvents.length === 0 ?
        <div className='flex min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-muted-foreground'>
          <p className='text-sm'>No events yet.</p>
          <Button
            variant='outline'
            size='sm'
            onClick={() => setShowCreateForm(true)}
          >
            Create your first event
          </Button>
        </div>
      : <div className='grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'>
          {paginatedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onView={setViewTarget}
              onEdit={(e) => {
                setEditTarget(e)
              }}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      }

      {/* ── Pagination ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, events.length)} of {events.length}
          </span>
          <Pagination className='mx-0 w-auto'>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  aria-disabled={page === 1}
                  className={page === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {buildPageNumbers(page, totalPages).map((p, idx) =>
                p === 'ellipsis' ?
                  <PaginationItem key={`ellipsis-${idx}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                : <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === page}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  aria-disabled={page === totalPages}
                  className={
                    page === totalPages ? 'pointer-events-none opacity-50' : ''
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* ── Dialogs ──────────────────────────────────────────────────────── */}
      <EventDetailDialog
        event={viewTarget}
        open={!!viewTarget}
        onOpenChange={(open) => !open && setViewTarget(null)}
      />

      <EventFormDialog
        event={null}
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSave={handleSave}
      />

      <EventFormDialog
        event={editTarget}
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
        onSave={handleSave}
      />

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent size='sm'>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className='font-medium text-foreground'>
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              render={<Button variant='destructive' />}
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
