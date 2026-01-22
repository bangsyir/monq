import { Link, useRouterState } from "@tanstack/react-router"
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  MapPin,
  Users,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// This is sample data.
const data = {
  navMain: [
    {
      title: "Main",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          title: "Places",
          url: "/admin/places",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          title: "Users",
          url: "/admin/users",
          icon: <Users className="h-4 w-4" />,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const routerState = useRouterState()

  const isActive = (url: string) => {
    if (url === "/admin") {
      return routerState.location.pathname === url
    }
    return routerState.location.pathname.startsWith(url)
  }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/admin" />}>
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Monq admin</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive(item.url)}
                      render={<Link to={item.url} />}
                    >
                      {item.icon}
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
