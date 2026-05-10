export function removeDuplicatesByKey<T>(
  array: T[],
  key: keyof T
): T[] {
  return [...new Map(array.map((item) => [item[key], item])).values()];
}
