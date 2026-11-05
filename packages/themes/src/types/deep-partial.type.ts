export type TectraDeepPartial<T> = { [K in keyof T]?: T[K] extends object ? TectraDeepPartial<T[K]> : T[K] };
