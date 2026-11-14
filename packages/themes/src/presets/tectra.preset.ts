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

/** Options of `createTectraPreset`: the style, the primary color and the surface palette. */
export interface TectraPresetOptions {
  /** Style object such as `softStyle` (default `tectraStyle`); pass the object, not its name. */
  style?: TectraStyle;
  /** Primary accent color, or `noir` for a color that follows the surface (default `blue`). */
  primary?: TectraPrimary;
  /** Neutral surface palette (default `ink`). */
  surface?: TectraSurface;
}

/** Builds the `noir` accent scale from a surface scale, so the primary color is black and white. */
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

/** Builds a preset from a style, a primary color and a surface palette. */
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
    source: { style: definition, primary, surface },
  };
}

/** Ready preset with the default style, blue primary and ink surface. */
export const Tectra = createTectraPreset();
/** Ready preset with the soft style, blue primary and ink surface. */
export const Soft = createTectraPreset({ style: softStyle });
/** Ready preset with the edge style, blue primary and ink surface. */
export const Edge = createTectraPreset({ style: edgeStyle });
/** Ready preset with the paper style, blue primary and ink surface. */
export const Paper = createTectraPreset({ style: paperStyle });
