import { redirect } from "@tanstack/react-router"
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createAuth } from "@/lib/auth"

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const auth = createAuth()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({
      to: "/login",
    })
  }
  return await next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
      },
    },
  })
})

export const authAdminMiddleware = createMiddleware().server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const auth = createAuth()
    const session = await auth.api.getSession({ headers })
    if (!session) {
      throw redirect({ to: "/login" })
    }
    if (session.user.role !== "admin") {
      throw redirect({ to: "/" })
    }
    return await next({
      context: {
        user: {
          id: session.user.id,
          name: session.user.name,
          image: session.user.image,
          role: session.user.role,
        },
      },
    })
  },
)

export const optionalAuthMiddleware = createMiddleware().server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const auth = createAuth()
    const session = await auth.api.getSession({ headers })

    if (session) {
      return await next({
        context: {
          user: {
            id: session.user.id,
            name: session.user.name,
            image: session.user.image,
            role: session.user.role,
          },
        },
      })
    }

    return await next()
  },
)
