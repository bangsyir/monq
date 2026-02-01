import { createServerFn } from "@tanstack/react-start"
import { asc, count, desc, ilike, or } from "drizzle-orm"
import { authMiddleware } from "@/lib/auth-middleware"
import { db } from "@/db"
import { users } from "@/db/schema"
import { UserQuerySchema, updateUserSchema } from "@/schema/user-schema"
import { updateUserService } from "@/services/user-service.server"

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

export const getUsersFn = createServerFn({ method: "GET" })
  .inputValidator(UserQuerySchema)
  .handler(async ({ data }) => {
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
