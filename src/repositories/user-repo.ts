import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"

type UpdateUserType = {
  userId: string
  name: string
  username: string
}

export async function updateUserProfile(data: UpdateUserType) {
  const { userId, name, username } = data
  const updatedUser = await db
    .update(users)
    .set({
      name,
      username,
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
