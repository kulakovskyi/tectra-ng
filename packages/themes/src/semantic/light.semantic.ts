import { SEVERITY_PALETTES, TectraColorScale, TectraColorStep, TectraSurfaceScale, shadows } from '@tectra-ng/tokens';
import { TectraPalettes } from '../types/preset.interface';
import { primaryBaseStep } from './contrast';
import { TectraSemanticTokens, TectraSeverityTokens } from '../types/semantic-tokens.interface';

function lightSeverity(scale: TectraColorScale, base: 600 | 700, surface: TectraSurfaceScale): TectraSeverityTokens {
  return {
    base: scale[base],
    hover: scale[(base + 100) as TectraColorStep],
    active: scale[(base + 200) as TectraColorStep],
    contrast: surface[0],
    soft: scale[50],
  };
}

export function createLightSemantic({ accent, surface }: TectraPalettes): TectraSemanticTokens {
  return {
    primary: { ...lightSeverity(accent, primaryBaseStep(accent), surface), softText: accent[700] },
    secondary: { base: surface[100], hover: surface[200], active: surface[300], border: surface[200], contrast: surface[800] },
    success: lightSeverity(SEVERITY_PALETTES.green, 700, surface),
    info: lightSeverity(SEVERITY_PALETTES.sky, 700, surface),
    warn: lightSeverity(SEVERITY_PALETTES.orange, 700, surface),
    danger: lightSeverity(SEVERITY_PALETTES.red, 600, surface),
    help: lightSeverity(SEVERITY_PALETTES.purple, 600, surface),
    contrast: { base: surface[950], hover: surface[900], active: surface[800], contrast: surface[0], soft: surface[100] },
    surface: {
      ground: surface[100],
      card: surface[0],
      hover: surface[50],
      border: surface[200],
      overlay: surface[0],
      overlayBorder: surface[200],
    },
    text: { primary: surface[900], hover: surface[950], muted: surface[600], mutedHover: surface[700] },
    field: {
      background: surface[0],
      disabledBackground: surface[100],
      border: surface[300],
      hoverBorder: surface[400],
      color: surface[900],
      placeholder: surface[500],
      icon: surface[500],
    },
    highlight: { background: accent[50], focusBackground: accent[100], color: accent[700], focusColor: accent[800] },
    list: { focusBackground: surface[100] },
    mask: { background: 'rgba(12, 16, 21, 0.45)' },
    focusRing: { color: accent[600] },
    shadow: { ...shadows },
  };
}
