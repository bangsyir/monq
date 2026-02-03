import { eq } from "drizzle-orm"
import { db } from "@/db"
import { categories } from "@/db/schema"

export interface Category {
  id: string
  name: string
  icon: string
  image: string | null
}

export interface UpdateCategoryInput {
  id: string
  name?: string
  icon?: string
  image?: string | null
}

export async function getAllCategories(): Promise<Array<Category>> {
  return await db.select().from(categories)
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const result = await db
    .select()
    .from(categories)
    .where(eq(categories.id, id))
    .limit(1)

  return result[0] || null
}

export async function updateCategory(
  input: UpdateCategoryInput,
): Promise<Category> {
  const { id, ...updates } = input

  const result = await db
    .update(categories)
    .set(updates)
    .where(eq(categories.id, id))
    .returning()

  if (!result[0]) {
    throw new Error("Category not found")
  }

  return result[0]
}
