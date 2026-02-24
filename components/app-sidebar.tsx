import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from '@/components/ui/sidebar'
import {
  IconCalendarEvent,
  IconFileText,
  IconLayoutDashboard,
  IconSettings,
  IconUsers
} from '@tabler/icons-react'
import Image from 'next/image'

const navItems = [
  { title: 'Dashboard', url: '/dashboard', icon: IconLayoutDashboard },
  { title: 'User Management', url: '/dashboard/user-management', icon: IconUsers },
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
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton render={<a href={item.url} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className='px-2 py-1 text-xs text-muted-foreground'>v1.0.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
