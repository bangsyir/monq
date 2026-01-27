import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { auth } from "./auth"
import { authMiddleware } from "@/lib/auth-middleware"

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(({ context }) => {
    return context.user
  })

export const getSessionUser = createServerFn({ method: "GET" }).handler(
  async () => {
    const headers = getRequestHeaders()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      return { user: null }
    }
    const { user } = session
    return {
      user: {
        name: user.name,
        username: user.username,
        email: user.email,
        image: user.image,
        role: user.role,
      },
    }
  },
)
