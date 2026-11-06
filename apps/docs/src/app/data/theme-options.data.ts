import { TECTRA_STYLES, TectraStyleName } from '@tectra-ng/themes';
import { ACCENT_PALETTES, PRIMARY_ORDER, SURFACE_PALETTES, TectraPrimary, TectraSurface } from '@tectra-ng/tokens';

export interface ThemeOption<T extends string> {
  value: T;
  label: string;
  color: string;
}

const title = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

export const PRIMARY_OPTIONS: ThemeOption<TectraPrimary>[] = PRIMARY_ORDER.map((value) => ({
  value,
  label: title(value),
  color: value === 'noir' ? 'var(--tx-text-primary)' : ACCENT_PALETTES[value][500],
}));

export const SURFACE_OPTIONS: ThemeOption<TectraSurface>[] = (Object.keys(SURFACE_PALETTES) as TectraSurface[]).map((value) => ({
  value,
  label: title(value),
  color: SURFACE_PALETTES[value][500],
}));

export const STYLE_OPTIONS: { value: TectraStyleName; label: string }[] = (Object.keys(TECTRA_STYLES) as TectraStyleName[]).map((value) => ({
  value,
  label: TECTRA_STYLES[value].label,
}));
