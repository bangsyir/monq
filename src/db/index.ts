import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/postgres-js"
import dotenv from "dotenv"
import * as schema from "./schema.ts"

dotenv.config()

// Factory function to create a new database connection for each request
// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export const createDb = createServerOnlyFn(() => {
  return drizzle(process.env.DATABASE_URL!, { schema })
})

// For backward compatibility - creates a new connection per call
// In Cloudflare Workers, this should be called within each request handler
export const getDb = createDb
