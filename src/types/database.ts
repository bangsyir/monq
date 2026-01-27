// types/database.ts

import type { DrizzleQueryError } from "drizzle-orm"
import type { PostgresError } from "postgres"

/**
 * Common shape for Database errors across different drivers (Postgres, SQLite, etc.)
 */
export type TDatabaseError = Error &
  DrizzleQueryError & { cause: PostgresError }

/**
 * Type Guard to check if an error is a TDatabaseError
 */
export function isDatabaseError(error: unknown): error is TDatabaseError {
  return (
    error instanceof Error &&
    ("code" in error || "detail" in error || "constraint" in error)
  )
}
