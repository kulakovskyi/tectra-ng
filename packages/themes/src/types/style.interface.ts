import { TectraComponentTokens } from '../components/component-tokens';
import { TectraDeepPartial } from './deep-partial.type';
import { TectraPalettes } from './preset.interface';
import { TectraSemanticTokens } from './semantic-tokens.interface';

export interface TectraStyle {
  label: string;
  light?: (palettes: TectraPalettes) => TectraDeepPartial<TectraSemanticTokens>;
  dark?: (palettes: TectraPalettes) => TectraDeepPartial<TectraSemanticTokens>;
  components?: TectraDeepPartial<TectraComponentTokens>;
  css?: string;
}
