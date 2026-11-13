import { TectraColorScale, TectraSurfaceScale } from '@tectra-ng/tokens';
import { TectraComponentTokens } from '../components/component-tokens';
import { TectraDeepPartial } from './deep-partial.type';
import { TectraSemanticTokens } from './semantic-tokens.interface';

/** Color scales a preset is built from. */
export interface TectraPalettes {
  /** Scale of the primary color. */
  accent: TectraColorScale;
  /** Scale of the neutral surface and text colors, with a `0` step for white. */
  surface: TectraSurfaceScale;
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
}

/** One CSS custom property with its value. */
export interface TectraCssVariable {
  /** Name with the leading dashes, like `--tx-radius-md`. */
  name: string;
  /** Value as it is written in CSS. */
  value: string;
}
