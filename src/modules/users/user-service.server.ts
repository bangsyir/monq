import {
  getUserByIdRepo,
  updateUserByIdRepo,
  updateUserProfileRepo,
} from "./user-repo.server"
import { safeDbQuery } from "@/utils/safe-db-query"

export async function getUserByIdService(userId: string) {
  const [user, userErr] = await safeDbQuery(getUserByIdRepo(userId))
  if (userErr) {
    return { message: userErr.message, error: userErr.error }
  }
  return { message: "success", data: user[0] || null }
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

export async function updateUserByIdService(data: AdminUpdateUserType) {
  const [updateUser, updateUserErr] = await safeDbQuery(
    updateUserByIdRepo(data),
  )
  if (updateUserErr) {
    return { message: updateUserErr.message, error: updateUserErr.error }
  }
  return { message: "success", data: updateUser[0] }
}

type UserUpdateType = {
  userId: string
  name: string
  username: string
  image: string | undefined
}
export async function updateUserService(data: UserUpdateType) {
  const [updateUser, updateUserErr] = await safeDbQuery(
    updateUserProfileRepo(data),
  )
  if (updateUserErr) {
    return { message: updateUserErr.message, error: updateUserErr.error }
  }
  return { message: "success", data: updateUser[0] }
}
