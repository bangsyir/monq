import { updateUserProfile } from "@/repositories/user-repo"
import { safeDbQuery } from "@/utils/safe-db-query"

type UserUpdateType = {
  userId: string
  name: string
  username: string
  image: string | undefined
}
export async function updateUserService(data: UserUpdateType) {
  const [updateUser, updateUserErr] = await safeDbQuery(updateUserProfile(data))
  if (updateUserErr) {
    return { message: updateUserErr.message, error: updateUserErr.error }
  }
  return { message: "success", data: updateUser[0] }
}
