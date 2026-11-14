import { TectraColorScale, TectraPrimary, TectraSurface, TectraSurfaceScale } from '@tectra-ng/tokens';
import { TectraComponentTokens } from '../components/component-tokens';
import { TectraDeepPartial } from './deep-partial.type';
import { TectraSemanticTokens } from './semantic-tokens.interface';
import { TectraStyle } from './style.interface';

/** Color scales a preset is built from. */
export interface TectraPalettes {
  /** Scale of the primary color. */
  accent: TectraColorScale;
  /** Scale of the neutral surface and text colors, with a `0` step for white. */
  surface: TectraSurfaceScale;
}

/** What `createTectraPreset` built a preset from: the style object, the primary color and the surface palette. */
export interface TectraPresetSource {
  /** The style object. */
  style: TectraStyle;
  /** The primary color. */
  primary: TectraPrimary;
  /** The surface palette. */
  surface: TectraSurface;
}

/** A complete theme: palettes, semantic tokens of both color schemes, component token overrides and extra CSS. */
export interface TectraPreset {
  /** Name of the preset, like `soft-blue-ink`. */
  name: string;
  /** Palettes the preset was built from. */
  palettes: TectraPalettes;
  /** Semantic tokens of the light color scheme. */
  light: TectraSemanticTokens;
  /** Semantic tokens of the dark color scheme. */
  dark: TectraSemanticTokens;
  /** Overrides of the component tokens. */
  components: TectraDeepPartial<TectraComponentTokens>;
  /** Extra CSS added after the variables. */
  css?: string;
  /** What the preset was built from; `createTectraPreset` sets it and `TxThemeService.updateTheme` starts from it. */
  source?: TectraPresetSource;
}

/** One CSS custom property with its value. */
export interface TectraCssVariable {
  /** Name with the leading dashes, like `--tx-radius-md`. */
  name: string;
  /** Value as it is written in CSS. */
  value: string;
}
