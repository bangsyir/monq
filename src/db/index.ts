import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "./schema.ts"
import { createServerOnlyFn } from "@tanstack/react-start"
const getDatabase = createServerOnlyFn(() => {
  return drizzle(process.env.DATABASE_URL!, { schema })
})

export const db = getDatabase()
