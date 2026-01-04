import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/admin')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    const user = await context.user
    if (user.role !== 'admin') {
      throw redirect({ to: '/dashboard', search: location.href })
    }
  },
})

function RouteComponent() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-6">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Welcome, Admin</h2>
          <p className="text-muted-foreground">
            You have successfully accessed admin dashboard.
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">Setting Admin Role</h3>
          <p className="text-muted-foreground text-sm mb-4">
            To set a user as admin, use the following command in your terminal:
          </p>
          <div className="bg-muted p-4 rounded-md">
            <code className="text-sm">
              pnpm tsx scripts/set-admin.ts {'<user-email>'}
            </code>
          </div>
          <p className="text-muted-foreground text-sm mt-4">Example:</p>
          <div className="bg-muted p-4 rounded-md">
            <code className="text-sm">
              pnpm tsx scripts/set-admin.ts admin@example.com
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}
