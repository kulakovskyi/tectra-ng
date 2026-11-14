import { TECTRA_STYLES, TectraColorChoice, TectraStyleName, tectraPrimaryChoices, tectraSurfaceChoices } from '@tectra-ng/themes';
import { TectraPrimary, TectraSurface } from '@tectra-ng/tokens';

export type ThemeOption<T extends string> = TectraColorChoice<T>;

export const PRIMARY_OPTIONS: ThemeOption<TectraPrimary>[] = tectraPrimaryChoices();

export const SURFACE_OPTIONS: ThemeOption<TectraSurface>[] = tectraSurfaceChoices();

export const STYLE_OPTIONS: { value: TectraStyleName; label: string }[] = (Object.keys(TECTRA_STYLES) as TectraStyleName[]).map((value) => ({
  value,
  label: TECTRA_STYLES[value].label,
}));
