import { ACCENT_PALETTES, SURFACE_PALETTES, TectraColorScale, TectraPrimary, TectraSurface, TectraSurfaceScale } from '@tectra-ng/tokens';
import { deepMerge } from '../define-preset';
import { createDarkSemantic } from '../semantic/dark.semantic';
import { createLightSemantic } from '../semantic/light.semantic';
import { edgeStyle } from '../styles/edge/edge.style';
import { paperStyle } from '../styles/paper/paper.style';
import { softStyle } from '../styles/soft/soft.style';
import { tectraStyle } from '../styles/tectra.style';
import { TectraStyle } from '../types/style.interface';
import { TectraPreset } from '../types/preset.interface';

export interface TectraPresetOptions {
  style?: TectraStyle;
  primary?: TectraPrimary;
  surface?: TectraSurface;
}

/* @__NO_SIDE_EFFECTS__ */
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

/* @__NO_SIDE_EFFECTS__ */
export function createTectraPreset({ style = tectraStyle, primary = 'blue', surface = 'ink' }: TectraPresetOptions = {}): TectraPreset {
  if (typeof style === 'string') {
    throw new Error(`createTectraPreset takes the style itself, not its name: import { ${String(style)}Style } from '@tectra-ng/themes' and pass { style: ${String(style)}Style }, or TECTRA_STYLES['${String(style)}'] to pick one by name.`);
  }
  const surfaceScale = SURFACE_PALETTES[surface];
  const palettes = { accent: primary === 'noir' ? noirScale(surfaceScale) : ACCENT_PALETTES[primary], surface: surfaceScale };
  const definition = style;
  return {
    name: `${definition.name}-${primary}-${surface}`,
    palettes,
    light: deepMerge(createLightSemantic(palettes), definition.light?.(palettes)),
    dark: deepMerge(createDarkSemantic(palettes), definition.dark?.(palettes)),
    components: definition.components ?? {},
    css: definition.css,
  };
}

export const Tectra = createTectraPreset();
export const Soft = createTectraPreset({ style: softStyle });
export const Edge = createTectraPreset({ style: edgeStyle });
export const Paper = createTectraPreset({ style: paperStyle });
