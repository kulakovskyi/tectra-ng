/** Makes every field of an object type, at any depth, optional; used for preset and style overrides. */
export type TectraDeepPartial<T> = { [K in keyof T]?: T[K] extends object ? TectraDeepPartial<T[K]> : T[K] };
