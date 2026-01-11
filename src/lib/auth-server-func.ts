import { createServerFn } from '@tanstack/react-start'

import { authMiddleware } from '@/lib/auth-middleware'

export const getUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context?.user
  })
