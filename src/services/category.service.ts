import type {
  Category,
  UpdateCategoryInput,
} from "@/repositories/category.repository"
import {
  getAllCategories as getAllCategoriesRepo,
  updateCategory as updateCategoryRepo,
} from "@/repositories/category.repository"

export { type Category, type UpdateCategoryInput }

export async function getAllCategories(): Promise<Array<Category>> {
  return await getAllCategoriesRepo()
}

export async function updateCategory(
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
