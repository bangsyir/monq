import {
  Outlet,
  createFileRoute,
  redirect,
  useRouterState,
} from "@tanstack/react-router";
import React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getSession } from "@/lib/auth-server-func";

export const Route = createFileRoute("/admin")({
  component: RouteComponent,
  beforeLoad: async () => {
    const session = await getSession();
    if (!session) {
      throw redirect({ to: "/login" });
    }
    if (session.user.role !== "admin") {
      throw redirect({ to: "/" });
    }
    return session;
  },
});

function RouteComponent() {
  const routerState = useRouterState();

  const breadcrumbs = React.useMemo(() => {
    const pathname = routerState.location.pathname;
    const crumbs = [];

    // Always include admin dashboard as first breadcrumb
    crumbs.push({
      label: "Dashboard",
      href: "/admin",
    });

    // Manual route matching based on pathname
    if (pathname === "/admin/users" || pathname.startsWith("/admin/users/")) {
      crumbs.push({
        label: "Users",
        href: "/admin/users",
      });
    }

    // Match dynamic user detail routes
    if (/^\/admin\/users\/[a-f0-9-]{36}$/.test(pathname)) {
      // Users breadcrumb already added above
      crumbs.push({
        label: "User Details",
        href: undefined, // Current page
      });
    }

    // Match dynamic user update routes
    if (/^\/admin\/users\/[a-f0-9-]{36}\/update$/.test(pathname)) {
      // Users breadcrumb already added above
      crumbs.push({
        label: "Update User",
        href: undefined, // Current page
      });
    }

    // Add other admin routes here as needed
    if (pathname === "/admin/places") {
      crumbs.push({
        label: "Places",
        href: "/admin/places",
      });
    }

    return crumbs;
  }, [routerState.location.pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
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
  );
}
