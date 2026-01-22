import { getFriendlyDbMessage } from "./errors"
import { tryCatch } from "./try-catch"
import type { TDatabaseError } from "@/types/database"

export type TAppError = {
  message: string
  error: Error
}

// The generic result type for your DB queries
export type TDbResult<TData> = [TData, null] | [null, TAppError]

export async function safeDbQuery<TData>(
  promise: Promise<TData>,
): Promise<TDbResult<TData>> {
  const [data, error] = await tryCatch<TData, TDatabaseError | Error>(promise)
  if (error) {
    return [null, { message: getFriendlyDbMessage(error), error: error }]
  }
  return [data, null]
}
