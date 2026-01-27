import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { GalleryVerticalEnd, LogOut } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { getSessionUser } from "@/lib/auth-server-func"

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  beforeLoad: async ({ location }) => {
    const session = await getSessionUser()
    if (!session) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href,
        },
      })
    }
    return session
  },
  loader: ({ context }) => {
    return { user: context.user }
  },
})

function RouteComponent() {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.navigate({ to: "/login" })
        },
      },
    })
  }

  return (
    <div>
      <div className="container mx-auto flex items-center justify-between px-4 py-2">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {isPending ? (
            <span className="text-muted-foreground text-sm">Loading...</span>
          ) : session ? (
            <>
              <Link to="/admin">Admin</Link>
              <span className="text-sm font-medium">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className={buttonVariants({
                  size: "sm",
                  variant: "outline",
                })}
              >
                <LogOut className="mr-2 size-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={buttonVariants({ size: "sm", variant: "outline" })}
            >
              login
            </Link>
          )}
        </div>
      </div>
      <Outlet />
    </div>
  )
}
