import { TectraDeepPartial } from '../../types/deep-partial.type';
import { TectraPalettes } from '../../types/preset.interface';
import { TectraSemanticTokens } from '../../types/semantic-tokens.interface';
import { primaryBaseStep } from '../../semantic/contrast';

export function paperLight({ accent, surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  const base = accent[primaryBaseStep(accent)];
  return {
    primary: { hover: accent[400], active: accent[300] },
    surface: { border: surface[300], overlayBorder: surface[0] },
    text: { mutedHover: surface[600] },
    field: {
      border: surface[400],
      hoverBorder: surface[900],
      disabledBackground: surface[300],
      placeholder: surface[600],
      icon: surface[600],
    },
    highlight: {
      background: `color-mix(in srgb, ${base}, transparent 88%)`,
      focusBackground: `color-mix(in srgb, ${base}, transparent 76%)`,
    },
    mask: { background: 'rgba(0, 0, 0, 0.32)' },
  };
}

export function paperDark({ surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  return {
    surface: { border: surface[700], overlayBorder: surface[900] },
    field: { border: surface[600], hoverBorder: surface[400], placeholder: surface[400], icon: surface[400] },
  };
}
