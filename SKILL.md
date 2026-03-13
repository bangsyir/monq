# Project Skill Reference

This document captures the knowledge and patterns used in this project for reuse in future projects.

## Technology Stack

| Category        | Technology                                   | Version             |
| --------------- | -------------------------------------------- | ------------------- |
| Framework       | React                                        | 19.2.4              |
| Router          | TanStack Start                               | 1.157.17            |
| Build Tool      | Vite                                         | 7.1.7               |
| Package Manager | Bun                                          | latest              |
| Language        | TypeScript                                   | 5.7.2 (strict mode) |
| Database        | PostgreSQL + Drizzle ORM                     | 0.45.1              |
| Authentication  | Better Auth                                  | 1.4.10              |
| UI              | Shadcn/UI + @base-ui/react + Tailwind CSS v4 | 4.0.6               |
| Form            | TanStack Form                                | 1.28.0              |
| Query           | TanStack Query                               | 5.90.20             |
| Rate Limiting   | Upstash Redis                                | 2.0.8               |
| Deployment      | Cloudflare Workers                           |                     |

## Project Structure

```
src/
├── components/          # React components
│   └── ui/             # Shadcn UI components
├── modules/            # Domain modules (three-layer architecture)
│   ├── places/         # Place module
│   │   ├── place.functions.ts      # Server functions (createServerFn)
│   │   ├── place-service.server.ts # Business logic
│   │   ├── place-repo.server.ts    # Database access
│   │   ├── place-schema.ts         # Zod schemas
│   │   └── index.ts                # Module exports
│   ├── categories/     # Category module
│   ├── users/          # User module
│   └── ...
├── db/                 # Database
│   ├── schema.ts       # Drizzle schema definitions
│   ├── index.ts        # Database connection
│   └── seed-*.ts       # Seed data
├── lib/                # Utilities and configs
│   ├── auth.ts         # Better Auth configuration
│   ├── auth-client.ts  # Auth client
│   ├── auth-middleware.ts # Auth middlewares
│   └── utils.ts        # General utilities
├── utils/              # Helper utilities
│   ├── safe-db-query.ts # DB error handling wrapper
│   ├── errors.ts       # Error messages and codes
│   └── promise.ts      # Promise utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── routes/             # TanStack Start routes (auto-generated)
```

## Three-Layer Architecture

### 1. Server Functions (`.functions.ts`)

```typescript
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { authMiddleware, rateLimitMiddleware } from "@/lib/auth-middleware"
import { createPlaceService } from "./place-service.server"
import { addPlaceServerSchema } from "./place-schema"

export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware]) // Optional: for protected routes
  .inputValidator(addPlaceServerSchema) // Optional: validates input
  .handler(async ({ data, context }) => {
    const userId = context.user.id // Available if authMiddleware used
    const result = await createPlaceService(data, userId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result
  })
```

### 2. Service Layer (`.service.server.ts`)

```typescript
import { safeDbQuery } from "@/utils/safe-db-query"
import { insertPlaceRepo, getPlaceByIdRepo } from "./place-repo.server"

export async function createPlaceService(data: AddPlaceData, userId: string) {
  // 1. Transform input data
  const placeData = { ...data, userId }

  // 2. Call repository with safe wrapper
  const [place, error] = await safeDbQuery(insertPlaceRepo(placeData))

  // 3. Handle errors
  if (error) {
    return error // Returns TAppError
  }

  // 4. Return success
  return { message: "Place created successfully", data: place }
}
```

### 3. Repository Layer (`.repo.server.ts`)

```typescript
import { db } from "@/db"
import { places } from "@/db/schema"
import { eq } from "drizzle-orm"

export function insertPlaceRepo(data: InsertPlace) {
  return db.insert(places).values(data).returning({ id: places.id })
}

export async function getPlaceByIdRepo(placeId: string) {
  return db.query.places.findFirst({
    where: eq(places.id, placeId),
    with: {
      images: true,
      categories: true,
    },
  })
}
```

## Authentication

### Server Setup (`src/lib/auth.ts`)

```typescript
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin } from "better-auth/plugins"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { createDb } from "@/db"
import * as schema from "@/db/schema"

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
    },
    plugins: [admin(), tanstackStartCookies()],
  })
}

export const auth = createAuth()
```

### Client Setup (`src/lib/auth-client.ts`)

```typescript
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import type { auth } from "./auth"

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL,
  plugins: [adminClient(), inferAdditionalFields<typeof auth>()],
})
```

### Middlewares (`src/lib/auth-middleware.ts`)

```typescript
import { redirect } from "@tanstack/react-router"
import { createMiddleware } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { createAuth } from "@/lib/auth"

export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const headers = getRequestHeaders()
  const auth = createAuth()
  const session = await auth.api.getSession({ headers })

  if (!session) {
    throw redirect({ to: "/login" })
  }
  return await next({
    context: {
      user: {
        id: session.user.id,
        name: session.user.name,
        image: session.user.image,
        role: session.user.role,
      },
    },
  })
})

export const optionalAuthMiddleware = createMiddleware().server(
  async ({ next }) => {
    const headers = getRequestHeaders()
    const auth = createAuth()
    const session = await auth.api.getSession({ headers })

    if (session) {
      return await next({
        context: { user: { id: session.user.id } },
      })
    }

    return await next()
  },
)
```

## Database Schema

### Basic Table with UUID

```typescript
import { pgTable, text, uuid, timestamp, index } from "drizzle-orm/pg-core"
import { v7 as uuidv7 } from "uuid"

export const places = pgTable(
  "places",
  {
    id: uuid("id")
      .$defaultFn(() => uuidv7())
      .primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("name_idx").on(table.name)],
)
```

### Table with Relations

```typescript
export const categories = pgTable("categories", {
  id: uuid("id")
    .$defaultFn(() => uuidv7())
    .primaryKey(),
  name: text("name").notNull(),
})

export const placeCategories = pgTable(
  "place_categories",
  {
    placeId: uuid("place_id")
      .notNull()
      .references(() => places.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("place_category_unique_idx").on(table.placeId, table.categoryId),
  ],
)

// Relations
export const placesRelations = relations(places, ({ one, many }) => ({
  user: one(users, { fields: [places.userId], references: [users.id] }),
  placeCategories: many(placeCategories),
  images: many(placeImages),
}))
```

### Array Fields

```typescript
amenities: text("amenities")
  .array()
  .default(sql`'{}'::text[]`),

bestSeason: text("best_season")
  .array()
  .default(sql`'{}'::text[]`),
```

## Error Handling

### Safe DB Query Wrapper (`src/utils/safe-db-query.ts`)

```typescript
import { getFriendlyDbMessage } from "./errors"
import { tryTo } from "./promise"

export type TAppError = {
  message: string
  error: Error
}

export type TResult<TData> = [TData, null] | [null, TAppError]

export const safeDbQuery = <TData>(
  promise: Promise<TData>,
): Promise<TResult<TData>> =>
  tryTo<TData, TDatabaseError>(promise).then(([data, error]) => {
    if (error) {
      const message = getFriendlyDbMessage(error as never)
      return [null, { message, error: error }]
    }
    return [data, null]
  })
```

### Error Messages (`src/utils/errors.ts`)

```typescript
export const DB_ERROR_CODES = {
  UNIQUE_VIOLATION: "23505",
  FOREIGN_KEY_VIOLATION: "23503",
  NOT_NULL_VIOLATION: "23502",
} as const

export function getFriendlyDbMessage(
  error: DrizzleQueryError & { cause: PostgresError },
): string {
  const constraintName = error.cause?.constraint_name
  const uniqueField = constraintName ? constraintName.split("_")[1] : "record"

  switch (error.cause?.code) {
    case DB_ERROR_CODES.UNIQUE_VIOLATION:
      return `This ${uniqueField} already exists.`
    case DB_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return "This action relates to a record that doesn't exist."
    case DB_ERROR_CODES.NOT_NULL_VIOLATION:
      return "A required field is missing."
    default:
      return error.message || "A database error occurred."
  }
}
```

## Rate Limiting

```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis/cloudflare"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})

export const searchRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10s"),
  prefix: "rate-limit:search",
})
```

## Database Connection

### For Cloudflare Workers

```typescript
import { drizzle } from "drizzle-orm/neon-http"
import { neon, neonConfig } from "@neondatabase/serverless"

export const createDb = createServerOnlyFn(() => {
  const sql = neon(process.env.DATABASE_URL)
  return drizzle({ client: sql, schema })
})
```

## Zod Schemas

```typescript
import { z } from "zod"

export const addPlaceServerSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
  categories: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export type AddPlaceServer = z.infer<typeof addPlaceServerSchema>
```

## Client-Side Usage

### Using TanStack Query with Server Functions

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getPlaces, addPlace } from "@/modules/places/place.functions"

function usePlaces() {
  const getPlacesFn = useServerFn(getPlaces)
  return useQuery({
    queryKey: ["places"],
    queryFn: () => getPlacesFn({ page: 1 }),
  })
}

function useAddPlace() {
  const queryClient = useQueryClient()
  const addPlaceFn = useServerFn(addPlace)

  return useMutation({
    mutationFn: addPlaceFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["places"] })
    },
  })
}
```

## Module Exports

Each module should export from `index.ts`:

```typescript
export * from "./place.functions"
export * from "./place-schema"
export type * from "./place-types"
```

## Configuration Files

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite dev --port 3000",
    "build": "vite build",
    "lint": "eslint",
    "format": "prettier",
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### vite.config.ts

```typescript
import tailwindcss from "@tailwindcss/vite"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"
import viteTsConfigPaths from "vite-tsconfig-paths"

const config = defineConfig({
  plugins: [
    devtools(),
    nitro({
      compatibilityDate: "2025-09-15",
      preset: "cloudflare_module",
      cloudflare: { deployConfig: true, nodeCompat: true },
    }),
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
})

export default config
```

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit"

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL },
})
```

## Import Organization

Order: external libraries → internal modules (`@/*`) → relative imports

```typescript
// 1. External libraries
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

// 2. Internal modules (use @/ aliases)
import { safeDbQuery } from "@/utils/safe-db-query"
import { places } from "@/db/schema"

// 3. Relative imports (only when necessary)
import { someLocalUtil } from "./utils"
```

## Naming Conventions

| Type                | Convention                 | Example                 |
| ------------------- | -------------------------- | ----------------------- |
| Components          | kebab-case                 | `user-profile.tsx`      |
| Functions/Variables | camelCase                  | `getUserData`           |
| Files (utilities)   | kebab-case                 | `safe-db-query.ts`      |
| Files (components)  | kebab-case                 | `place-card.tsx`        |
| Server Functions    | camelCase                  | `getPlaces`, `addPlace` |
| Services            | camelCase + Service suffix | `createPlaceService`    |
| Repositories        | camelCase + Repo suffix    | `insertPlaceRepo`       |

## Common Patterns

### Pagination Response

```typescript
return {
  places: result.data,
  totalCount: totalPlaces.data?.count,
  currentPage: currentPage,
  totalPage: Math.ceil(Number(totalPlaces.data?.count) / limit),
  hasLeft: currentPage > 1,
  hasMore: currentPage < totalPage,
}
```

### JSON Aggregation in PostgreSQL

```typescript
categories: sql<Array<string>>`COALESCE(
  JSON_AGG(DISTINCT ${categories.name}) FILTER (WHERE ${categories.name} IS NOT NULL),
  '[]'::json
)`,
```

### Conditional Query Building

```typescript
let categoryCondition = sql`TRUE`
if (categoryFilter && categoryFilter !== "all") {
  categoryCondition = sql`EXISTS (
    SELECT 1 FROM ${placeCategories}
    INNER JOIN ${categories} ON ${placeCategories.categoryId} = ${categories.id}
    WHERE ${placeCategories.placeId} = ${places.id}
    AND LOWER(${categories.name}) = LOWER(${categoryFilter})
  )`
}
```

## Environment Variables

```
DATABASE_URL=postgresql://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
BETTER_AUTH_URL=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```
