export function mapValues<T, O>(record: Readonly<Record<string, T>>, transformer: (value: T) => O): Record<string, O> {
  const ret: Record<string, O> = {};
  const entries = Object.entries(record);

  for (const [key, value] of entries) {
    const mappedValue = transformer(value);

    ret[key] = mappedValue;
  }

  return ret;
}
