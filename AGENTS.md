# AGENTS.md

### Database (Drizzle ORM)

```bash
bun db:generate   # Generate migrations from schema changes
bun db:migrate     # Apply pending migrations
bun db:push       # Push schema directly to database
bun db:pull       # Pull schema from database
bun db:studio     # Open Drizzle Studio for database management
```

## Technology Stack

- **Framework**: React 19.2.0 with TanStack Start (file-based routing)
- **Build Tool**: Vite 7.1.7
- **Package Manager**: Bun (uses pnpm in scripts but Bun is preferred)
- **Language**: TypeScript 5.7.2 (strict mode enabled)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **UI**: Shadcn/UI @base-ui/react components with Tailwind CSS v4

## Code Style Guidelines

### Import Organization

- Eslint automatically organizes imports on save
- Use path aliases: `@/components/*`, `@/lib/utils`, `@/hooks/*`
- Order: external libraries → internal modules → relative imports

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Functions/Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE for exports, camelCase for locals
- **Files**: kebab-case for utilities, PascalCase for components
- **Hooks**: `use` prefix (e.g., `useUserData`)

### TypeScript Standards

- Strict mode enabled - all type checking enforced
- Use explicit return types for public APIs
- Prefer `interface` over `type` for object shapes
- Use `const` assertions for readonly data
- Unused locals/parameters are checked and should be removed

### Error Handling

- Use TanStack Query's built-in error handling for API calls
- Implement error boundaries for React components
- Log errors appropriately but don't expose sensitive data
- Use Zod for runtime validation and error reporting

## UI Development

### Shadcn/UI Components

```bash
# Install new components (always use latest version)
pnpm dlx shadcn@latest add [component-name]
```

### Styling with Tailwind v4

- Use utility classes from the configured design system
- Leverage CSS custom properties for theming
- Dark mode support via next-themes
- Responsive design with mobile-first approach

### Component Patterns

- Place reusable components in `src/components/`
- UI components from shadcn go in `src/components/ui/`
- Use compound component patterns for complex UIs
- Implement proper TypeScript props interfaces

## Database & API

### Schema Changes

1. Edit `src/db/schema.ts`
2. Run `bun db:generate` to create migration
3. Run `bun db:migrate` to apply changes
4. Use `bun db:studio` for visual database management

### API Patterns

- Use TanStack Query and Tanstact start for data fetching
- Implement proper loading/error states
- Cache strategies via query keys
- Optimistic updates for better UX

## Testing Guidelines

- Place tests alongside components (`Component.test.tsx`) or in `__tests__` directories
- Use Vitest with React Testing Library
- Test user behavior, not implementation details
- Mock external dependencies and API calls
- Ensure accessibility in component tests

## Performance Considerations

- Use React.memo() for expensive components
- Implement proper loading states and skeleton screens
- Optimize images and assets
- Leverage code splitting with TanStack Router
- Monitor bundle size with Vite's build analyzer

## Security Best Practices

- Never commit secrets or API keys
- Validate all inputs with Zod schemas
- Use environment variables for configuration
- Implement proper authentication checks
- Sanitize user-generated content
