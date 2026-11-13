import { TectraComponentTokens } from '../components/component-tokens';
import { TectraDeepPartial } from './deep-partial.type';
import { TectraPalettes } from './preset.interface';
import { TectraSemanticTokens } from './semantic-tokens.interface';

/** A look for the kit: semantic and component token overrides and optional CSS on top of the default look. */
export interface TectraStyle {
  /** Name of the style, like `soft`. */
  name: string;
  /** Name of the style to show to people. */
  label: string;
  /** Builds overrides of the light semantic tokens from the palettes. */
  light?: (palettes: TectraPalettes) => TectraDeepPartial<TectraSemanticTokens>;
  /** Builds overrides of the dark semantic tokens from the palettes. */
  dark?: (palettes: TectraPalettes) => TectraDeepPartial<TectraSemanticTokens>;
  /** Overrides of the component tokens. */
  components?: TectraDeepPartial<TectraComponentTokens>;
  /** Extra CSS that goes with the style. */
  css?: string;
}
