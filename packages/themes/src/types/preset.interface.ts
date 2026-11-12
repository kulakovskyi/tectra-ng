import { TectraColorScale, TectraSurfaceScale } from '@tectra-ng/tokens';
import { TectraComponentTokens } from '../components/component-tokens';
import { TectraDeepPartial } from './deep-partial.type';
import { TectraSemanticTokens } from './semantic-tokens.interface';

export interface TectraPalettes {
  accent: TectraColorScale;
  surface: TectraSurfaceScale;
}

export interface TectraPreset {
  name: string;
  palettes: TectraPalettes;
  light: TectraSemanticTokens;
  dark: TectraSemanticTokens;
  components: TectraDeepPartial<TectraComponentTokens>;
  css?: string;
}

export interface TectraCssVariable {
  name: string;
  value: string;
}
