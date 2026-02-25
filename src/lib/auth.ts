import * as process from "node:process"
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { createDb } from "@/db"
import * as schema from "@/db/schema"

// Factory function to create auth instance for each request
// Required for Cloudflare Workers where I/O objects cannot be shared across requests
export function createAuth() {
  const db = createDb()
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: schema,
      usePlural: true,
    }),
    user: {
      additionalFields: {
        username: {
          type: "string",
          required: true,
          input: true,
        },
      },
    },
    advanced: {
      database: {
        generateId: "uuid",
      },
      ipAddress: {
        // Use Cloudflare's IP header for Cloudflare Workers
        ipAddressHeaders: ["cf-connecting-ip", "x-forwarded-for"],
        // Or disable IP tracking entirely if you prefer:
        // disableIpTracking: true,
      },
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        mapProfileToUser: (profile) => {
          return {
            username: profile.email.split("@")[0],
          }
        },
      },
    },
    trustedOrigins: [
      "http://localhost:3000",
      "http://localhost:8787",
      "https://monq.boshir.workers.dev",
    ],
    plugins: [admin(), tanstackStartCookies()],
  })
}

// Backward compatibility - single instance for non-Cloudflare environments
// In Cloudflare Workers, use createAuth() instead
export const auth = createAuth()
