import { ACCENT_PALETTES, TectraAccent } from '@tectra-ng/tokens';

export const THEME_ACCENTS: { label: string; value: TectraAccent; color: string }[] = (
  ['blue', 'green', 'purple', 'cyan', 'teal'] as TectraAccent[]
).map((value) => ({ label: value.charAt(0).toUpperCase() + value.slice(1), value, color: ACCENT_PALETTES[value][500] }));
