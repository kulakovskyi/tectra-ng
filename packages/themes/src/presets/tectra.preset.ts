import { ACCENT_PALETTES, SURFACE_PALETTES, TectraColorScale, TectraPrimary, TectraSurface, TectraSurfaceScale } from '@tectra-ng/tokens';
import { COMPONENT_TOKENS } from '../components/component-tokens';
import { deepMerge } from '../define-preset';
import { createDarkSemantic } from '../semantic/dark.semantic';
import { createLightSemantic } from '../semantic/light.semantic';
import { TECTRA_STYLES, TectraStyleName } from '../styles/styles';
import { TectraPreset } from '../types/preset.interface';

export interface TectraPresetOptions {
  style?: TectraStyleName;
  primary?: TectraPrimary;
  surface?: TectraSurface;
}

export function noirScale(surface: TectraSurfaceScale): TectraColorScale {
  return {
    50: surface[50],
    100: surface[100],
    200: surface[200],
    300: surface[100],
    400: surface[50],
    500: surface[500],
    600: surface[950],
    700: surface[900],
    800: surface[800],
    900: surface[900],
    950: surface[950],
  };
}

export function createTectraPreset({ style = 'tectra', primary = 'blue', surface = 'ink' }: TectraPresetOptions = {}): TectraPreset {
  const surfaceScale = SURFACE_PALETTES[surface];
  const palettes = { accent: primary === 'noir' ? noirScale(surfaceScale) : ACCENT_PALETTES[primary], surface: surfaceScale };
  const definition = TECTRA_STYLES[style];
  return {
    name: `${style}-${primary}-${surface}`,
    palettes,
    light: deepMerge(createLightSemantic(palettes), definition.light?.(palettes)),
    dark: deepMerge(createDarkSemantic(palettes), definition.dark?.(palettes)),
    components: deepMerge(COMPONENT_TOKENS, definition.components),
    css: definition.css,
  };
}

export const Tectra = createTectraPreset();
export const Soft = createTectraPreset({ style: 'soft' });
export const Edge = createTectraPreset({ style: 'edge' });
export const Paper = createTectraPreset({ style: 'paper' });
