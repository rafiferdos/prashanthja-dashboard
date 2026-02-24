import { Skeleton } from '@/components/ui/skeleton'

export function EventCardSkeleton() {
  return (
    <div className='flex flex-col overflow-hidden rounded-2xl ring-1 ring-foreground/10 bg-card'>
      {/* ── Hero image ─────────────────────────────────────────────────── */}
      <Skeleton className='h-44 w-full rounded-none' />

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className='flex flex-1 flex-col gap-3 p-4'>
        {/* title */}
        <Skeleton className='h-4 w-3/4' />
        <Skeleton className='h-3.5 w-1/2' />

        {/* description lines */}
        <div className='flex flex-col gap-1.5'>
          <Skeleton className='h-3 w-full' />
          <Skeleton className='h-3 w-5/6' />
        </div>

        {/* date & location meta */}
        <div className='mt-auto flex flex-col gap-2'>
          <div className='flex items-center gap-1.5'>
            <Skeleton className='h-3.5 w-3.5 rounded-sm shrink-0' />
            <Skeleton className='h-3 w-28' />
          </div>
          <div className='flex items-center gap-1.5'>
            <Skeleton className='h-3.5 w-3.5 rounded-sm shrink-0' />
            <Skeleton className='h-3 w-20' />
          </div>
        </div>
      </div>

      {/* ── Host footer ──────────────────────────────────────────────── */}
      <div className='border-t px-4 py-3 flex items-center gap-2'>
        <Skeleton className='h-6 w-6 rounded-full shrink-0' />
        <Skeleton className='h-3 w-24' />
      </div>
    </div>
  )
}
