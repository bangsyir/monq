import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/postgres-js"
import dotenv from "dotenv"
import * as schema from "./schema.ts"

dotenv.config()

const getDatabase = createServerOnlyFn(() => {
  return drizzle(process.env.DATABASE_URL!, { schema })
})

export const db = getDatabase()
