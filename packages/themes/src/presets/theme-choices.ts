import { ACCENT_PALETTES, PRIMARY_ORDER, SURFACE_PALETTES, TectraPrimary, TectraSurface } from '@tectra-ng/tokens';
import { tokenRef } from '../components/token-helpers';

export type { TectraPrimary, TectraSurface };

/** A color a theme picker offers: the value `createTectraPreset` takes, the color of its swatch and a label. */
export interface TectraColorChoice<T extends string = string> {
  /** The value passed to `createTectraPreset`, like `teal`. */
  value: T;
  /** CSS color of the swatch. */
  color: string;
  /** Name to show to people, like `Teal`. */
  label: string;
}

/* @__NO_SIDE_EFFECTS__ */
function title(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** The primary colors `createTectraPreset` takes, in picker order; the `noir` swatch follows the text color. */
/* @__NO_SIDE_EFFECTS__ */
export function tectraPrimaryChoices(): TectraColorChoice<TectraPrimary>[] {
  return PRIMARY_ORDER.map((value) => ({
    value,
    label: title(value),
    color: value === 'noir' ? tokenRef('text-primary') : ACCENT_PALETTES[value][500],
  }));
}

/** The surface palettes `createTectraPreset` takes, each with the middle step of its scale as the swatch. */
/* @__NO_SIDE_EFFECTS__ */
export function tectraSurfaceChoices(): TectraColorChoice<TectraSurface>[] {
  return (Object.keys(SURFACE_PALETTES) as TectraSurface[]).map((value) => ({ value, label: title(value), color: SURFACE_PALETTES[value][500] }));
}

/** Whether a value is the name of a primary color that `createTectraPreset` takes. */
export function isTectraPrimary(value: unknown): value is TectraPrimary {
  return typeof value === 'string' && PRIMARY_ORDER.includes(value as TectraPrimary);
}

/** Whether a value is the name of a surface palette that `createTectraPreset` takes. */
export function isTectraSurface(value: unknown): value is TectraSurface {
  return typeof value === 'string' && Object.hasOwn(SURFACE_PALETTES, value);
}
