import { ACCENT_PALETTES, INK_SURFACE, TectraAccent } from '@tectra/tokens';
import { createDarkSemantic } from '../../semantic/dark.semantic';
import { createLightSemantic } from '../../semantic/light.semantic';
import { TectraPreset } from '../../types/preset.interface';

export function createInkPreset(accent: TectraAccent = 'blue'): TectraPreset {
  const palettes = { accent: ACCENT_PALETTES[accent], surface: INK_SURFACE };
  return { name: `ink-${accent}`, light: createLightSemantic(palettes), dark: createDarkSemantic(palettes) };
}

export const InkPreset = createInkPreset();
