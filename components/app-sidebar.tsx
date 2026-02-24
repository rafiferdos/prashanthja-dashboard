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
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import {
  IconLayoutDashboard,
  IconSettings,
  IconUser,
  IconChartBar,
  IconInbox,
} from "@tabler/icons-react"

const navItems = [
  { title: "Dashboard", url: "/dashboard", icon: IconLayoutDashboard },
  { title: "Analytics", url: "/dashboard/analytics", icon: IconChartBar },
  { title: "Inbox", url: "/dashboard/inbox", icon: IconInbox },
  { title: "Profile", url: "/dashboard/profile", icon: IconUser },
  { title: "Settings", url: "/dashboard/settings", icon: IconSettings },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-lg font-semibold">Dashboard</span>
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
        <div className="px-2 py-1 text-xs text-muted-foreground">v1.0.0</div>
      </SidebarFooter>
    </Sidebar>
  )
}
