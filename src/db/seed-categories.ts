import { v7 as uuidv7 } from "uuid"
import { createDb } from "@/db"
import { categories } from "@/db/schema"

const categoryData = [
  { name: "Waterfall", icon: "💧" },
  { name: "Campsite", icon: "⛺" },
  { name: "Hiking", icon: "🥾" },
  { name: "Trail", icon: "🛤️" },
  { name: "Lake", icon: "🏞️" },
  { name: "Mountain", icon: "🏔️" },
  { name: "Hill", icon: "⛰️" },
  { name: "River", icon: "🛶" },
  { name: "Recreation", icon: "🎡" },
]

const main = async () => {
  const db = createDb()
  try {
    const existingCategories = await db.select().from(categories)

    if (existingCategories.length === 0) {
      await db.insert(categories).values(
        categoryData.map((cat) => ({
          id: uuidv7(),
          ...cat,
        })),
      )
      console.log("Categories seeded successfully")
    } else {
      console.log("Categories already exist")
    }
  } catch (error) {
    console.error("Error seeding categories:", error)
  }
}
main()
