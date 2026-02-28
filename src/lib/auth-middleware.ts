import { redirect } from "@tanstack/react-router"
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders, getRequestIP } from "@tanstack/react-start/server"
import { createAuth } from "@/lib/auth"
import { commentRateLimit, searchRateLimit } from "@/lib/rate-limit"

function getClientIP(): string {
  const headers = getRequestHeaders()
  const ip =
    getRequestIP() ??
    headers["x-forwarded-for"]?.split(",")[0]?.trim() ??
    headers["X-Forwarded-For"]?.split(",")[0]?.trim() ??
    headers["x-real-ip"] ??
    headers["X-Real-IP"] ??
    headers["cf-connecting-ip"] ??
    headers["CF-Connecting-IP"] ??
    "unknown"
  return ip
}

export const rateLimitMiddleware = createMiddleware().server(
  async ({ next }) => {
    if (import.meta.env.DEV) {
      return await next()
    }

    const ip = getClientIP()

    const { success } = await searchRateLimit.limit(ip)

    if (!success) {
      throw new Error("RATE_LIMIT_EXCEEDED")
    }

    return await next()
  },
)

export const commentRateLimitMiddleware = createMiddleware().server(
  async ({ next }) => {
    if (import.meta.env.DEV) {
      return await next()
    }

    const ip = getClientIP()
    const { success } = await commentRateLimit.limit(ip)

    if (!success) {
      throw new Error("RATE_LIMIT_EXCEEDED")
    }

    return await next()
  },
)

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
