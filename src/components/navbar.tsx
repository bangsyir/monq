import { Link, useNavigate } from '@tanstack/react-router'
import { Loader } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'
import { authClient } from '@/lib/auth-client'
import { Button } from './ui/button'

export function Navbar() {
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate({ to: '/login' })
        },
      },
    })
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 pt-2 pb-2 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative container mx-auto flex items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Loader className="size-4" />
          </div>
          monq.
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isPending ? (
            <div>Loading...</div>
          ) : session ? (
            <>
              <div>{session.user.name}</div>
              <Button variant={'outline'} size={'sm'} onClick={handleLogout}>
                logout
              </Button>
            </>
          ) : (
            <Link to="/login">Login</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
