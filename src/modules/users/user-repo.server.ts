import { eq } from "drizzle-orm"
import { db } from "@/db"
import { users } from "@/db/schema"

type UpdateUserType = {
  userId: string
  name: string
  username: string
  image: string | undefined
}

export function updateUserProfileRepo(data: UpdateUserType) {
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
