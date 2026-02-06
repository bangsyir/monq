import z from "zod"

export const updateUserSchema = z.object({
  name: z.string().min(5),
  username: z.string().min(5),
  email: z.email(),
  image: z.string(),
})

export const UserQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().optional(),
  sortBy: z
    .enum(["name", "email", "createdAt", "role"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),
})
export type UserFilter = z.infer<typeof UserQuerySchema>
