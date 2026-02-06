export async function tryTo<TData, TError = Error>(
  promise: Promise<TData>,
): Promise<[TData, null] | [null, TError]> {
  return promise
    .then<[TData, null]>((data) => [data, null])
    .catch<[null, TError]>((err) => [null, err])
}
