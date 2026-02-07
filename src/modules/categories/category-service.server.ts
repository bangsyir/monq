import {
  getAllCategoriesRepo,
  updateCategoryRepo,
} from "./category-repo.server"
import type { Category, UpdateCategoryInput } from "./category-types"
import { safeDbQuery } from "@/utils/safe-db-query"

export { type Category, type UpdateCategoryInput }

export async function getAllCategoriesService() {
  const [data, error] = await safeDbQuery(getAllCategoriesRepo())
  if (error) {
    return { message: error.message, error }
  }

  return { message: "success get categories", data }
}

export async function updateCategoryService(input: UpdateCategoryInput) {
  if (!input.name?.trim()) {
    throw new Error("Category name is required")
  }

  if (!input.icon?.trim()) {
    throw new Error("Category icon is required")
  }
  const [data, error] = await safeDbQuery(updateCategoryRepo(input))
  if (error) {
    return { error }
  }
  return { data }
}
