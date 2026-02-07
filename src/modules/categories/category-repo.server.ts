import { eq } from "drizzle-orm"
import type { UpdateCategoryInput } from "./category-types"
import { db } from "@/db"
import { categories } from "@/db/schema"

export function getAllCategoriesRepo() {
  return db.select().from(categories)
}

export function getCategoryById(id: string) {
  const result = db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  return result
}

export function updateCategoryRepo(input: UpdateCategoryInput) {
  const { id, ...updates } = input

  const result = db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning()

  return result
}
