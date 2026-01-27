import { createServerFn } from "@tanstack/react-start"
import { eq } from "drizzle-orm"
import { authMiddleware } from "@/lib/auth-middleware"
import { db } from "@/db"
import { users } from "@/db/schema"
import { updateUserSchema } from "@/schema/user-schema"
import { updateUserService } from "@/services/user-service.server"

export const getUserProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id

    const user = await db
      .select({
        id: users.id,
        name: users.name,
        username: users.username,
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
  .inputValidator(updateUserSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { name, username } = data

    const updatedUser = await updateUserService({ userId, name, username })
    if (updatedUser.error) {
      throw new Error(updatedUser.message, { cause: updatedUser.error.cause })
    }

    return updatedUser.data || null
  })
