import { createServerFn } from "@tanstack/react-start"
import { asc, count, desc, ilike, or } from "drizzle-orm"
import { z } from "zod"
import {
  getUserByIdService,
  updateUserByIdService,
  updateUserService,
} from "./user-service.server"
import { UserQuerySchema, updateUserSchema } from "./user-schema"
import { authMiddleware } from "@/lib/auth-middleware"
import { createDb } from "@/db"
import { users } from "@/db/schema"

export const getUserById = createServerFn({ method: "GET" })
  .inputValidator(z.object({ userId: z.string() }))
  .handler(async ({ data }) => {
    const result = await getUserByIdService(data.userId)
    if (result.error) {
      throw new Error(result.message, { cause: result.error.cause })
    }
    return result.data
  })

const adminUpdateUserSchema = z.object({
  userId: z.string().min(1, "user id required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["user", "admin"]).default("user"),
  emailVerified: z.boolean().default(false),
  banned: z.boolean().default(false),
  banReason: z.string().optional(),
  banExpires: z.string().optional(),
})

export const updateUserById = createServerFn({ method: "POST" })
  .inputValidator(adminUpdateUserSchema)
  .handler(async ({ data }) => {
    const { banExpires, ...updateData } = data
    const result = await updateUserByIdService({
      ...updateData,
      banExpires: banExpires ? new Date(banExpires) : null,
    })
    if (result.error) {
      throw new Error(result.message, { cause: result.error.cause })
    }
    return result.data
  })

export const updateUserProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(updateUserSchema)
  .handler(async ({ context, data }) => {
    const userId = context.user.id
    const { name, username, image } = data

    const updatedUser = await updateUserService({
      userId,
      name,
      username,
      image,
    })
    if (updatedUser.error) {
      throw new Error(updatedUser.message, { cause: updatedUser.error.cause })
    }

    return updatedUser.data || null
  })

export const getUsers = createServerFn({ method: "GET" })
  .inputValidator(UserQuerySchema)
  .handler(async ({ data }) => {
    const db = createDb()
    const { search, page, sortBy, sortOrder } = data
    const currentPage = page || 1
    const limit = 100
    const offset = (currentPage - 1) * limit

    // Build where conditions
    const whereConditions = search
      ? or(ilike(users.name, `%${search}%`), ilike(users.email, `%${search}%`))
      : undefined
    const total = await db
      .select({ count: count() })
      .from(users)
      .where(whereConditions)

    // Optimize: Use a single query with subquery for better performance
    // This gets both the filtered count and the paginated results in one database round trip
    const query = db
      .select({
        // User fields
        id: users.id,
        name: users.name,
        username: users.username,
        email: users.email,
        emailVerified: users.emailVerified,
        image: users.image,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
        role: users.role,
        banned: users.banned,
        banReason: users.banReason,
        banExpires: users.banExpires,
      })
      .from(users)
      .where(whereConditions)

    // Determine sort column
    const sortColumn =
      sortBy === "name"
        ? users.name
        : sortBy === "email"
          ? users.email
          : sortBy === "role"
            ? users.role
            : users.createdAt

    // Apply ordering, pagination and execute
    const result = await query
      .orderBy(sortOrder === "desc" ? desc(sortColumn) : asc(sortColumn))
      .limit(limit)
      .offset(offset)

    const totalPage = Math.ceil(total[0].count / limit)

    // Extract count from first row (all rows have the same total count)
    // const totalCount = result[0]?.totalCount || 0

    return {
      users: result,
      totalCount: total[0].count,
      totalPage: totalPage,
      currentPage: currentPage,
      hasLeft: currentPage > 1,
      hasMore: currentPage < totalPage,
    }
  })
