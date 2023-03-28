export function assertsFulfilled<T>(
  result: PromiseSettledResult<T>[],
): asserts result is PromiseFulfilledResult<T>[] {
  if (result.find((res) => res.status === 'rejected')) {
    throw new Error('error when fetching');
  }
}
