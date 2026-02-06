import {
  getAllCategoriesRepo,
  updateCategoryRepo,
} from "./category-repo.server"
import type { Category, UpdateCategoryInput } from "./category-types"

export { type Category, type UpdateCategoryInput }

export async function getAllCategoriesService(): Promise<Array<Category>> {
  return await getAllCategoriesRepo()
}

export async function updateCategoryService(
  input: UpdateCategoryInput,
): Promise<Category> {
  if (!input.name?.trim()) {
    throw new Error("Category name is required")
  }

  if (!input.icon?.trim()) {
    throw new Error("Category icon is required")
  }

  return await updateCategoryRepo(input)
}
