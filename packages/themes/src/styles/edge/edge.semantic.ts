import { TectraDeepPartial } from '../../types/deep-partial.type';
import { TectraPalettes } from '../../types/preset.interface';
import { TectraSemanticTokens } from '../../types/semantic-tokens.interface';
import { primaryBaseStep } from '../../semantic/contrast';

export function edgeLight({ accent, surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  const base = primaryBaseStep(accent);
  return {
    surface: { hover: surface[200], border: surface[400], overlayBorder: 'transparent' },
    field: {
      border: surface[500],
      hoverBorder: surface[500],
      disabledBackground: surface[300],
      placeholder: surface[600],
      icon: surface[900],
    },
    highlight: { background: accent[base], focusBackground: accent[base === 600 ? 700 : 800], color: surface[0], focusColor: surface[0] },
    list: { focusBackground: surface[200] },
  };
}

export function edgeDark({ accent, surface }: TectraPalettes): TectraDeepPartial<TectraSemanticTokens> {
  return {
    primary: { base: accent[400], hover: accent[300], active: accent[200] },
    surface: { hover: surface[700], border: surface[500] },
    field: { border: surface[500], hoverBorder: surface[500], icon: surface[0] },
    highlight: { background: accent[500], focusBackground: accent[400], color: surface[950], focusColor: surface[950] },
    list: { focusBackground: surface[700] },
    focusRing: { color: accent[500] },
  };
}
