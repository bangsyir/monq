import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "@/lib/auth-middleware"
import { db } from "@/db"
import { users } from "@/db/schema"
import { eq } from "drizzle-orm"

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    return user[0] || null
  })

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { name, email } = data as unknown as { name?: string; email?: string }

    const updatedUser = await db
      .update(users)
      .set({
        name,
        email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
      })

    return updatedUser[0] || null
  })
