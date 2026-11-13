import { TectraDeepPartial } from './types/deep-partial.type';
import { TectraPreset } from './types/preset.interface';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Merges overrides into a base object at any depth, without changing the base; arrays and values replace. */
/* @__NO_SIDE_EFFECTS__ */
export function deepMerge<T>(base: T, overrides: TectraDeepPartial<T> | undefined): T {
  if (!overrides) {
    return base;
  }
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(overrides)) {
    result[key] = isPlainObject(value) && isPlainObject(result[key]) ? deepMerge(result[key], value) : value;
  }
  return result as T;
}

/** Creates a preset from a base preset and deep overrides. */
/* @__NO_SIDE_EFFECTS__ */
export function definePreset(base: TectraPreset, overrides: TectraDeepPartial<TectraPreset>): TectraPreset {
  return deepMerge(base, overrides);
}
