// types/database.ts

/**
 * Common shape for Database errors across different drivers (Postgres, SQLite, etc.)
 */
export type TDatabaseError = Error & {
	code?: string; // SQL State code (e.g., '23505' for unique violation)
	detail?: string; // Detailed message from the DB
	table?: string; // Table name where the error occurred
	constraint?: string; // Constraint name that was violated
};

/**
 * Type Guard to check if an error is a TDatabaseError
 */
export function isDatabaseError(error: unknown): error is TDatabaseError {
	return (
		error instanceof Error &&
		("code" in error || "detail" in error || "constraint" in error)
	);
}
