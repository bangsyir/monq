import { eq } from "drizzle-orm"
import { createDb } from "@/db"
import { users } from "@/db/schema"

export function getUserByIdRepo(userId: string) {
  const db = createDb()
  return db.select().from(users).where(eq(users.id, userId)).limit(1)
}

type UpdateUserType = {
  userId: string
  name: string
  username: string
  image: string | undefined
}

export function updateUserProfileRepo(data: UpdateUserType) {
  const db = createDb()
  const { userId, name, username, image } = data
  const updatedUser = db
    .update(users)
    .set({
      name,
      username,
      image,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      username: users.username,
      image: users.image,
    })
  return updatedUser
}

type AdminUpdateUserType = {
  userId: string
  name: string
  email: string
  role: "user" | "admin"
  emailVerified: boolean
  banned: boolean
  banReason?: string
  banExpires?: Date | null
}

export function updateUserByIdRepo(data: AdminUpdateUserType) {
  const db = createDb()
  const { userId, banExpires, ...updateData } = data
  return db
    .update(users)
    .set({
      ...updateData,
      updatedAt: new Date(),
      banExpires: banExpires ?? null,
    })
    .where(eq(users.id, userId))
    .returning()
}
