import { TectraDeepPartial } from '../../types/deep-partial.type';
import { TectraPalettes } from '../../types/preset.interface';
import { TectraSemanticTokens } from '../../types/semantic-tokens.interface';

const shadow = {
  field: 'none',
  overlay: '0 18px 44px -16px rgba(12, 16, 21, 0.26), 0 4px 12px -4px rgba(12, 16, 21, 0.08)',
  modal: '0 40px 80px -28px rgba(12, 16, 21, 0.4), 0 8px 24px -8px rgba(12, 16, 21, 0.12)',
};

export function softLight({ surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  return {
    surface: { border: surface[100], overlayBorder: 'transparent' },
    field: { disabledBackground: surface[200], placeholder: surface[600], icon: surface[600] },
    shadow,
  };
}

export function softDark({ surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  return {
    surface: { border: surface[800], overlayBorder: surface[800] },
    field: { disabledBackground: surface[700] },
    shadow,
  };
}
