import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/postgres-js"

import * as schema from "./schema.ts"

const getDatabase = createServerOnlyFn(() => {
  return drizzle(process.env.DATABASE_URL!, { schema })
})

export const db = getDatabase()
