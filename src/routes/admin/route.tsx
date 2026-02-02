import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router"
import React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Route configuration mapping - easy to maintain
const routeConfig: Record<
  string,
  {
    label: string
    isDynamic?: boolean
    dynamicLabel?: string
    parent?: string
  }
> = {
  users: {
    label: "Users",
    parent: "/admin",
  },
  places: {
    label: "Places",
    parent: "/admin",
  },
  gallery: {
    label: "Gallery",
    parent: "/admin",
  },
}

// Dynamic segment patterns
const dynamicPatterns = [
  { pattern: /^[a-f0-9-]{36}$/, label: "Details" },
  { pattern: /^add$/, label: "Add New" },
  { pattern: /^update$/, label: "Update" },
  { pattern: /^images$/, label: "Images" },
]

function getSegmentLabel(segment: string): string {
  // Check if it's a known route
  if (routeConfig[segment]) {
    return routeConfig[segment].label
  }

  // Check dynamic patterns
  for (const { pattern, label } of dynamicPatterns) {
    if (pattern.test(segment)) {
      return label
    }
  }

  // Fallback: capitalize and format
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  loader: ({ context }) => {
    if (!context.user) {
      throw redirect({ to: "/login" })
    }
    if (context.user.role !== "admin") {
      throw redirect({ to: "/" })
    }
    return { user: context.user }
  },
})

function RouteComponent() {
  const routerState = useRouterState()

  const breadcrumbs = React.useMemo(() => {
    const pathname = routerState.location.pathname
    const crumbs: Array<{ label: string; href: string | undefined }> = []

    // Always include admin dashboard as first breadcrumb
    crumbs.push({
      label: "Dashboard",
      href: "/admin",
    })

    // Skip if we're on the dashboard itself
    if (pathname === "/admin") {
      return crumbs
    }

    // Parse the path segments
    const segments = pathname.replace("/admin/", "").split("/")
    let currentPath = "/admin"

    // Build breadcrumbs from segments
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment) continue

      currentPath += `/${segment}`
      const label = getSegmentLabel(segment)

      // Check if this is the last segment (current page)
      const isLast = i === segments.length - 1

      crumbs.push({
        label,
        href: isLast ? undefined : currentPath,
      })
    }

    return crumbs
  }, [routerState.location.pathname])

  const loaderData = Route.useLoaderData()
  const { role, ...restData } = loaderData.user

  return (
    <SidebarProvider>
      <AppSidebar user={restData} />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="my-4" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.label}-${index}`}>
                  <BreadcrumbItem className="hidden md:block">
                    {crumb.href ? (
                      <BreadcrumbLink
                        href={crumb.href}
                        className="flex items-center"
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    ) : (
                      <BreadcrumbPage className="flex items-center">
                        {crumb.label}
                      </BreadcrumbPage>
                    )}
                  </BreadcrumbItem>
                  {index < breadcrumbs.length - 1 && (
                    <BreadcrumbSeparator className="hidden md:block" />
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="container mx-auto px-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
