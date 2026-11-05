import { TectraPreset } from './types/preset.interface';

export function definePreset(base: TectraPreset, overrides: Partial<TectraPreset>): TectraPreset {
  return { ...base, ...overrides };
}
