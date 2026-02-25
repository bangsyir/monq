import * as process from "node:process"
import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema.ts"

// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export const createDb = createServerOnlyFn(() => {
  const sql = neon(process.env.DATABASE_URL)
  return drizzle({ client: sql, schema })
})

// For backward compatibility - creates a new connection per call
// In Cloudflare Workers, this should be called within each request handler
export const getDb = createDb
