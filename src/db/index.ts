import * as process from "node:process"
import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/neon-http"
import { neon, neonConfig } from "@neondatabase/serverless"
import * as schema from "./schema.ts"

// Factory function to create a new database connection for each request
// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export const createDb = createServerOnlyFn(() => {
  const isLocal = process.env.LOCAL_DEV || false
  if (isLocal) {
    const connectionString = process.env.DATABASE_URL
    neonConfig.fetchEndpoint = (host) => {
      const [protocol, port] =
        host === "db.localtest.me" ? ["http", 4444] : ["https", 443]
      return `${protocol}://${host}:${port}/sql`
    }
    const connectionStringUrl = new URL(connectionString)
    neonConfig.useSecureWebSocket =
      connectionStringUrl.hostname !== "db.localtest.me"
    neonConfig.wsProxy = (host) =>
      host === "db.localtest.me" ? `${host}:4444/v2` : `${host}/v2`
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle({ client: sql, schema })
})

// For backward compatibility - creates a new connection per call
// In Cloudflare Workers, this should be called within each request handler
export const getDb = createDb
