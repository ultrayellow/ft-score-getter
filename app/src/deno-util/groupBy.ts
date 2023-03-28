export function groupBy<T, K extends string>(array: readonly T[], selector: (el: T) => K): Partial<Record<K, T[]>> {
  const ret: Partial<Record<K, T[]>> = {};

  for (const element of array) {
    const key = selector(element);
    const arr = (ret[key] ??= [] as T[]);
    arr.push(element);
  }

  return ret;
}
