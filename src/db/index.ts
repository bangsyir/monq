import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/neon-http"
import dotenv from "dotenv"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema.ts"

dotenv.config()

// Factory function to create a new database connection for each request
// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export const createDb = createServerOnlyFn(() => {
  const sql = neon(process.env.DATABASE_URL!)
  return drizzle({ client: sql, schema })
})

// For backward compatibility - creates a new connection per call
// In Cloudflare Workers, this should be called within each request handler
export const getDb = createDb
