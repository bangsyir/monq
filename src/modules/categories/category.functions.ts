import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import {
  getAllCategoriesService,
  updateCategoryService,
} from "./category-service.server"
import type { Category } from "@/services/category.service"
import { authMiddleware } from "@/lib/auth-middleware"

const UpdateCategorySchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  icon: z.string().optional(),
  image: z.string().nullable().optional(),
})

export const getCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async (): Promise<Array<Category>> => {
    return await getAllCategoriesService()
  })

export const updateCategory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .inputValidator(UpdateCategorySchema)
  .handler(async ({ data }): Promise<Category> => {
    return await updateCategoryService(data)
  })
