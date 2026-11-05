import { TectraColorScale, TectraSurfaceScale } from '@tectra/tokens';
import { TectraComponentTokens } from '../components/component-tokens';
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
  components: TectraComponentTokens;
}

export interface TectraCssVariable {
  name: string;
  value: string;
}
