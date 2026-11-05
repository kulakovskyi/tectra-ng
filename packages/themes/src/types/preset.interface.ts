import { TectraColorScale, TectraSurfaceScale } from '@tectra/tokens';
import { TectraSemanticTokens } from './semantic-tokens.interface';

export interface TectraPreset {
  name: string;
  light: TectraSemanticTokens;
  dark: TectraSemanticTokens;
}

export interface TectraPalettes {
  accent: TectraColorScale;
  surface: TectraSurfaceScale;
}

export interface TectraCssVariable {
  name: string;
  value: string;
}
