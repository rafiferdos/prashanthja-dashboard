'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from '@/components/ui/sidebar'
import {
  IconCalendarEvent,
  IconFileText,
  IconLayoutDashboard,
  IconSettings,
  IconUsers
} from '@tabler/icons-react'

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
  {
    title: 'User Management',
    url: '/dashboard/user-management',
    icon: IconUsers
  },
  {
    title: 'Event Management',
    url: '/dashboard/event-management',
    icon: IconCalendarEvent
  },
  {
    title: 'Content Management',
    url: '/dashboard/content-management',
    icon: IconFileText
  },
  { title: 'Settings', url: '/dashboard/settings', icon: IconSettings }
]

export function AppSidebar() {
  const pathname = usePathname()

  const isActive = (url: string) =>
    url === '/dashboard' ? pathname === url : pathname.startsWith(url)

  return (
    <Sidebar>
      <SidebarHeader>
        <div className='flex h-75 items-center justify-center'>
          <Image
            src='/assets/logo.svg'
            alt='Logo'
            width={180}
            height={180}
            className='object-contain'
          />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const active = isActive(item.url)
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      render={<Link href={item.url} />}
                      isActive={active}
                      className={
                        active ?
                          'bg-linear-to-r from-[#1F889E] to-[#20B482] text-sidebar-primary-foreground! saturate-200 hover:saturate-100 transition-all duration-300'
                        : 'transition-all duration-300'
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className='px-3 py-2 text-xs text-muted-foreground'>v1.0.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
