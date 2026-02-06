import { getFriendlyDbMessage } from "./errors"
import { tryTo } from "./promise"
import type { TDatabaseError } from "@/types/database"

export type TAppError = {
  message: string
  error: Error
}

// The generic result type for your DB queries
export type TResult<TData> = [TData, null] | [null, TAppError]

export const safeDbQuery = <TData>(
  promise: Promise<TData>,
): Promise<TResult<TData>> =>
  tryTo<TData, TDatabaseError>(promise).then(([data, error]) => {
    if (error) {
      return [null, { message: getFriendlyDbMessage(error), error: error }]
    }
    return [data, null]
  })
