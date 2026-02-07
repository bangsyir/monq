import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  getAllCategoriesService,
  updateCategoryService,
} from "./category-service.server"
import type { Category } from "./category-types.ts"
import { authMiddleware } from "@/lib/auth-middleware"

const UpdateCategorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().nullable().optional(),
})

export const getCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Array<Category>> => {
    const categories = await getAllCategoriesService()
    if (categories.error) {
      throw new Error(categories.message, {
        cause: categories.error.error.cause,
      })
    }
    return categories.data
  },
)

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(UpdateCategorySchema)
  .handler(async ({ data }) => {
    const update = await updateCategoryService(data)
    if (update.error) {
      throw new Error(update.error?.message, {
        cause: update.error?.error.cause,
      })
    }
    return update.data
  })
