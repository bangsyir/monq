import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL!, // The base URL of your auth server
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
