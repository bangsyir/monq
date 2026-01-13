import { isDatabaseError } from "@/types/database";

export const DB_ERROR_CODES = {
	UNIQUE_VIOLATION: "23505",
	FOREIGN_KEY_VIOLATION: "23503",
	NOT_NULL_VIOLATION: "23502",
	CONNECTION_FAILURE: "08006",
} as const;

export type TDbErrorCode = (typeof DB_ERROR_CODES)[keyof typeof DB_ERROR_CODES];

/**
 * Translates a DB error code into a user-friendly message.
 */
export function getFriendlyDbMessage(error: unknown): string {
	if (!isDatabaseError(error)) return "An unexpected error occurred.";

	switch (error.code) {
		case DB_ERROR_CODES.UNIQUE_VIOLATION:
			return "This record already exists.";
		case DB_ERROR_CODES.FOREIGN_KEY_VIOLATION:
			return "This action relates to a record that doesn't exist.";
		case DB_ERROR_CODES.NOT_NULL_VIOLATION:
			return "A required field is missing.";
		default:
			return "A database error occurred.";
	}
}
