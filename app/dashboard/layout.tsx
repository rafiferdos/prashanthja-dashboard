'use client'

import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { AppSidebar } from '@/components/app-sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger
} from '@/components/ui/sidebar'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* ── Fixed top bar ─────────────────────────────────────────── */}
        <header className='sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b bg-background/80 px-4 backdrop-blur-md'>
          <SidebarTrigger className='-ml-1' />

          {/* ── Profile dropdown ──────────────────────────────────── */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className='
                group flex items-center gap-2.5 rounded-xl px-2 py-1.5
                transition-colors hover:bg-accent focus-visible:outline-none
              '
            >
              {/* Avatar */}
              <span
                className='
                  flex size-8 shrink-0 items-center justify-center rounded-full
                  bg-linear-to-br from-[#1F889E] to-[#20B482]
                  text-xs font-bold text-white shadow-sm
                '
              >
                PJ
              </span>
              {/* Name + role — hidden on small screens */}
              <span className='hidden flex-col items-start leading-tight sm:flex'>
                <span className='text-sm font-semibold'>Prashanth Ja</span>
                <span className='text-[11px] text-muted-foreground'>Admin</span>
              </span>
              <IconChevronDown
                className='
                  hidden size-4 text-muted-foreground
                  transition-transform duration-200 group-data-[popup-open]:rotate-180 sm:block
                '
              />
            </DropdownMenuTrigger>

            <DropdownMenuContent align='end' sideOffset={8} className='w-60'>
              {/* ── Identity header ── */}
              <div className='flex items-center gap-3 px-3 py-3'>
                <span
                  className='
                    flex size-10 shrink-0 items-center justify-center rounded-full
                    bg-linear-to-br from-[#1F889E] to-[#20B482]
                    text-sm font-bold text-white shadow
                  '
                >
                  PJ
                </span>
                <div className='flex flex-col leading-tight'>
                  <span className='text-sm font-semibold'>Prashanth Ja</span>
                  <span className='text-xs text-muted-foreground'>
                    prashanth@sparktech.dev
                  </span>
                </div>
              </div>

              <DropdownMenuSeparator />

              {/* ── Actions ── */}
              <DropdownMenuItem
                render={<Link href='/dashboard/settings' />}
                className='gap-3'
              >
                <IconSettings className='size-4 text-muted-foreground' />
                <span>Profile Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                variant='destructive'
                className='gap-3'
                onClick={() => router.push('/')}
              >
                <IconLogout className='size-4' />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className='flex flex-1 flex-col gap-4 p-4'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
