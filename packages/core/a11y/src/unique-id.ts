let counter = 0;

/** Returns a page-unique id with the given prefix, like `tx-input-3`; used for `id` and ARIA links. */
export function uniqueId(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}
