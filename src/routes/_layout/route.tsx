import { buttonVariants } from '@/components/ui/button'
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { GalleryVerticalEnd, LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'
import { getUser } from '@/lib/auth-server-func'
export const Route = createFileRoute('/_layout')({
  component: RouteComponent,

  beforeLoad: () => {
    const user = getUser()
    return { user }
  },
  loader: async ({ context, location }) => {
    if (!context) {
      throw redirect({ to: '/login', search: location.href })
    }
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
          router.navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <div>
      <div className="container flex justify-between items-center mx-auto px-4 py-2">
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
            <span className="text-sm text-muted-foreground">Loading...</span>
          ) : session ? (
            <>
              <Link to="/admin">Admin</Link>
              <span className="text-sm font-medium">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={handleLogout}
                className={buttonVariants({
                  size: 'sm',
                  variant: 'outline',
                })}
              >
                <LogOut className="size-4 mr-2" />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className={buttonVariants({ size: 'sm', variant: 'outline' })}
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
