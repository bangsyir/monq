import { createServerFn } from "@tanstack/react-start"
import { authMiddleware } from "@/lib/auth-middleware"
import { db } from "@/db"
import { categories } from "@/db/schema"

export const getCategories = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const allCategories = await db.select().from(categories)
    return allCategories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      value: cat.name.toLowerCase(), // For backward compatibility with form
    }))
  })
