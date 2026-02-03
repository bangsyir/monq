import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import type { Category } from "@/services/category.service"
import { authMiddleware } from "@/lib/auth-middleware"
import { getAllCategories, updateCategory } from "@/services/category.service"

const UpdateCategorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().nullable().optional(),
})

export const getCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<Category>> => {
    return await getAllCategories()
  })

export const updateCategoryFn = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(UpdateCategorySchema)
  .handler(async ({ data }): Promise<Category> => {
    return await updateCategory(data)
  })
