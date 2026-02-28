import * as process from "node:process"
import { createServerOnlyFn } from "@tanstack/react-start"
import { drizzle } from "drizzle-orm/neon-http"
import { neon, neonConfig } from "@neondatabase/serverless"
import ws from "ws"
import * as schema from "./schema.ts"

// Factory function to create a new database connection for each request
// This is required for Cloudflare Workers where I/O objects cannot be shared across requests
export const createDb = createServerOnlyFn(() => {
  const isLocal = process.env.LOCAL_DEV || false
  if (isLocal) {
    // HTTP Mode (recommended for most applications)
    neonConfig.fetchEndpoint = "http://localhost:5432/sql" // Routes HTTP requests to local proxy
    neonConfig.poolQueryViaFetch = true // Enables HTTP connection pooling

    // WebSocket Mode (for real-time applications)
    neonConfig.webSocketConstructor = ws // Enables WebSocket support
    neonConfig.useSecureWebSocket = false // Local proxy doesn't use SSL
    neonConfig.wsProxy = () => "localhost:5432" // Routes WebSocket connections to local proxy
    neonConfig.pipelineConnect = false
  }
  const sql = neon(process.env.DATABASE_URL)
  return drizzle({ client: sql, schema })
})

// For backward compatibility - creates a new connection per call
// In Cloudflare Workers, this should be called within each request handler
export const getDb = createDb
