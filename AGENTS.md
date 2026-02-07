# AGENTS.md

AI coding rules and guidelines for this project.

## Important Rules

- **DO NOT** run `bun dev` or `bun run dev` - the user always runs it on port :3000
- If you need to run dev for checking, make sure to stop it immediately after

---

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

---

## Project Architecture

### Folder Structure

```
src/
├── components/          # React components
│   └── ui/             # Shadcn UI components (DO NOT MODIFY)
├── modules/            # Domain modules
│   ├── places/         # Place module
│   │   ├── place.functions.ts      # Server functions (createServerFn)
│   │   ├── place-service.server.ts # Business logic
│   │   ├── place-repo.server.ts    # Database access
│   │   ├── place-schema.ts         # Zod schemas
│   │   └── index.ts                # Module exports
│   ├── categories/     # Category module
│   └── users/          # User module
├── db/                 # Database
│   ├── schema.ts       # Drizzle schema definitions
│   ├── seed-*.ts       # Seed data
│   └── index.ts        # Database connection
├── lib/                # Utilities and configs
│   ├── auth.ts         # Better Auth configuration
│   ├── auth-client.ts  # Auth client
│   └── utils.ts        # General utilities
├── utils/              # Helper utilities
│   ├── safe-db-query.ts # DB error handling wrapper
│   ├── errors.ts       # Error messages and codes
│   └── promise.ts      # Promise utilities
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
└── routes/             # TanStack Start routes (auto-generated)
```

---

## Code Style Guidelines

### Import Organization

Order: external libraries → internal modules (`@/*`) → relative imports

```typescript
// 1. External libraries
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

// 2. Internal modules (use @/ aliases)
import { authMiddleware } from "@/lib/auth-middleware"
import { safeDbQuery } from "@/utils/safe-db-query"
import { places } from "@/db/schema"

// 3. Relative imports (only when necessary)
import { someLocalUtil } from "./utils"
```

### Naming Conventions

| Type                | Convention                 | Example                 |
| ------------------- | -------------------------- | ----------------------- |
| Components          | kebab-case                 | `user-profile.tsx`      |
| Functions/Variables | camelCase                  | `getUserData`           |
| Constants (exports) | UPPER_SNAKE_CASE           | `MAX_RETRY_COUNT`       |
| Constants (locals)  | camelCase                  | `maxRetryCount`         |
| Files (utilities)   | kebab-case                 | `safe-db-query.ts`      |
| Files (components)  | kebab-case                 | `place-card.tsx`        |
| Hooks               | use + PascalCase           | `useUserData.ts`        |
| Server Functions    | camelCase                  | `getPlaces`, `addPlace` |
| Services            | camelCase + Service suffix | `createPlaceService`    |
| Repositories        | camelCase + Repo suffix    | `insertPlaceRepo`       |

### TypeScript Standards

- Strict mode enabled - all type checking enforced
- Use explicit return types for public APIs
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for readonly data
- Remove unused locals/parameters

---

## Server Functions Pattern

Server functions use `createServerFn` from TanStack Start. Follow this pattern:

### 1. Server Function (in `*.functions.ts`)

```typescript
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import { authMiddleware } from "@/lib/auth-middleware"
import { createPlaceService } from "./place-service.server"

const addPlaceSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
})

export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware]) // Optional: for protected routes
  .inputValidator(addPlaceSchema) // Optional: validates input
  .handler(async ({ data, context }) => {
    const userId = context.user.id // Available if authMiddleware used
    const result = await createPlaceService(data, userId)

    if (result.error) {
      throw new Error(result.error.message)
    }

    return result
  })
```

### 2. Route Integration

```typescript
// In route file (e.g., routes/places.tsx)
import { createFileRoute } from "@tanstack/react-router"
import { getPlaces } from "@/modules/places/place.functions"

export const Route = createFileRoute("/places")({
  loader: async () => {
    const places = await getPlaces({ page: 1 })
    return { places }
  },
})
```

### 3. Component Usage

```typescript
import { useServerFn } from "@tanstack/react-start"
import { useQuery } from "@tanstack/react-query"
import { getPlaces } from "@/modules/places/place.functions"

function PlaceList() {
  const getPlacesFn = useServerFn(getPlaces)

  const { data, isLoading, error } = useQuery({
    queryKey: ["places"],
    queryFn: () => getPlacesFn({ page: 1 }),
  })

  // Handle loading, error, and data states
}
```

---

## Service Layer Pattern

Services contain business logic and orchestrate between server functions and repositories.

```typescript
// place-service.server.ts
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

### Error Handling in Services

Always use `safeDbQuery` for database operations:

```typescript
import { safeDbQuery } from "@/utils/safe-db-query"

const [result, error] = await safeDbQuery(someDbOperation())

if (error) {
  // error is TAppError with { message: string, error: Error }
  return error
}

return { data: result, error: null }
```

---

## Repository Layer Pattern

Repositories handle direct database access using Drizzle ORM.

```typescript
// place-repo.server.ts
import { db } from "@/db"
import { places } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function insertPlaceRepo(data: InsertPlace) {
  return await db.insert(places).values(data).returning({ id: places.id })
}

export async function getPlaceByIdRepo(placeId: string) {
  return await db.query.places.findFirst({
    where: eq(places.id, placeId),
    with: {
      images: true,
      categories: true,
    },
  })
}

export async function updatePlaceRepo(
  placeId: string,
  data: Partial<InsertPlace>,
) {
  return await db
    .update(places)
    .set(data)
    .where(eq(places.id, placeId))
    .returning()
}
```

---

## Database Operations

### Schema Changes Workflow

1. Edit `src/db/schema.ts`
2. Run `bun db:generate` to create migration
3. Run `bun db:migrate` to apply changes
4. Use `bun db:studio` for visual database management

### Available Commands

```bash
bun db:generate   # Generate migrations from schema changes
bun db:migrate    # Apply pending migrations
bun db:push       # Push schema directly to database (dev only)
bun db:pull       # Pull schema from database
bun db:studio     # Open Drizzle Studio GUI
```

### Error Handling

Use the built-in error handling utilities:

```typescript
import { safeDbQuery } from "@/utils/safe-db-query"
import { getFriendlyDbMessage } from "@/utils/errors"

// safeDbQuery returns [data, null] or [null, error]
const [data, error] = await safeDbQuery(dbOperation())

// Error types are automatically handled:
// - UNIQUE_VIOLATION (23505): "This {field} already exists."
// - FOREIGN_KEY_VIOLATION (23503): "This action relates to a record that doesn't exist."
// - NOT_NULL_VIOLATION (23502): "A required field is missing."
```

---

## Component Guidelines

### UI Components

- Place reusable components in `src/components/`
- Shadcn UI components go in `src/components/ui/` - **DO NOT MODIFY**
- Use compound component patterns for complex UIs
- Implement proper TypeScript props interfaces

### Styling with Tailwind v4

- Use utility classes from the configured design system
- Leverage CSS custom properties for theming
- Dark mode support via next-themes
- Responsive design with mobile-first approach

### Example Component

```typescript
// components/place-card.tsx
import { Card, CardHeader, CardContent } from "@/components/ui/card"

interface PlaceCardProps {
  place: Place
  onSelect?: (place: Place) => void
}

export function PlaceCard({ place, onSelect }: PlaceCardProps) {
  return (
    <Card onClick={() => onSelect?.(place)}>
      <CardHeader>{place.name}</CardHeader>
      <CardContent>{place.description}</CardContent>
    </Card>
  )
}
```

---

## Authentication

This project uses Better Auth.

```typescript
// Protected server function
export const addPlace = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const userId = context.user.id
    // User is authenticated
  })

// Client-side auth check
import { authClient } from "@/lib/auth-client"

const { data: session } = await authClient.getSession()
```

---

## Data Fetching Patterns

### Using TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useServerFn } from "@tanstack/react-start"
import { getPlaces, addPlace } from "@/modules/places/place.functions"

// Query
function usePlaces() {
  const getPlacesFn = useServerFn(getPlaces)
  return useQuery({
    queryKey: ["places"],
    queryFn: () => getPlacesFn({ page: 1 }),
  })
}

// Mutation
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

---

## Error Handling

### Client-Side

```typescript
import { useQuery } from "@tanstack/react-query"

const { data, error, isLoading } = useQuery({
  queryKey: ["places"],
  queryFn: fetchPlaces,
})

if (isLoading) return <LoadingSkeleton />
if (error) return <ErrorMessage message={error.message} />
```

### Server-Side

```typescript
export const getPlace = createServerFn({ method: "GET" }).handler(async () => {
  const [place, error] = await safeDbQuery(getPlaceRepo(id))

  if (error) {
    throw new Error(error.message)
  }

  return place
})
```

---

## Validation

Use Zod for runtime validation:

```typescript
import { z } from "zod"

export const placeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
})

export type PlaceInput = z.infer<typeof placeSchema>
```

---

## Performance Best Practices

- Use `React.memo()` for expensive components
- Implement proper loading states and skeleton screens
- Optimize images with `sharp` or Next.js Image
- Leverage code splitting with TanStack Router
- Use proper query keys for caching in TanStack Query
- Implement pagination for large datasets

---

## Security Guidelines

- Never commit secrets or API keys
- Validate all inputs with Zod schemas
- Use environment variables for configuration
- Implement proper authentication checks using `authMiddleware`
- Sanitize user-generated content
- Use `safeDbQuery` to prevent SQL injection (Drizzle handles this)

---

## Module Exports Pattern

Each module should export its public API from `index.ts`:

```typescript
// modules/places/index.ts
export * from "./place.functions"
export * from "./place-schema"
export type * from "./place-types"
```

---

## Adding Shadcn Components

Use the latest version of Shadcn:

```bash
pnpm dlx shadcn@latest add button
```

---

## Code Quality Commands

```bash
bun run lint      # Run ESLint
bun run format    # Run Prettier
bun run check     # Run both lint and format with fix
bun run test      # Run tests
```

---

## WARNING

- if you run bun run dev or bun dev for check code please kill the bun run dev or bun dev again
- beacause i always run the bun run dev it other terminal

## Summary of Key Patterns

1. **Three-Layer Architecture**: Functions → Services → Repositories
2. **Server Functions**: Use `createServerFn` with optional middleware and validators
3. **Error Handling**: Always use `safeDbQuery` for DB operations
4. **Naming**: Be consistent with conventions (Service/Repo suffixes)
5. **Imports**: Use `@/` aliases, order: external → internal → relative
6. **Types**: Use strict TypeScript, prefer interfaces over types
7. **Styling**: Tailwind v4 with design system utilities
8. **Auth**: Use `authMiddleware` for protected routes
