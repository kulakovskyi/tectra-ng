import { SEVERITY_PALETTES, TectraColorScale, TectraSurfaceScale, shadows } from '@tectra/tokens';
import { TectraPalettes } from '../types/preset.interface';
import { TectraSemanticTokens, TectraSeverityTokens } from '../types/semantic-tokens.interface';

function darkSeverity(scale: TectraColorScale, surface: TectraSurfaceScale): TectraSeverityTokens {
  return {
    base: scale[400],
    hover: scale[300],
    active: scale[200],
    contrast: surface[950],
    soft: `color-mix(in srgb, ${scale[400]} 8%, ${surface[900]})`,
  };
}

export function createDarkSemantic({ accent, surface }: TectraPalettes): TectraSemanticTokens {
  return {
    primary: {
      ...darkSeverity(accent, surface),
      soft: `color-mix(in srgb, ${accent[400]}, transparent 82%)`,
      softText: accent[200],
    },
    secondary: { base: surface[800], hover: surface[700], active: surface[600], border: surface[700], contrast: surface[100] },
    success: darkSeverity(SEVERITY_PALETTES.green, surface),
    info: darkSeverity(SEVERITY_PALETTES.sky, surface),
    warn: darkSeverity(SEVERITY_PALETTES.orange, surface),
    danger: darkSeverity(SEVERITY_PALETTES.red, surface),
    help: darkSeverity(SEVERITY_PALETTES.purple, surface),
    contrast: { base: surface[0], hover: surface[100], active: surface[200], contrast: surface[950], soft: surface[800] },
    surface: {
      ground: surface[950],
      card: surface[900],
      hover: surface[800],
      border: surface[800],
      overlay: surface[900],
      overlayBorder: surface[700],
    },
    text: { primary: surface[50], hover: surface[0], muted: surface[400], mutedHover: surface[300] },
    field: {
      background: surface[950],
      disabledBackground: surface[800],
      border: surface[700],
      hoverBorder: surface[600],
      color: surface[50],
      placeholder: surface[400],
      icon: surface[400],
    },
    highlight: {
      background: `color-mix(in srgb, ${accent[400]}, transparent 82%)`,
      focusBackground: `color-mix(in srgb, ${accent[400]}, transparent 72%)`,
      color: accent[200],
      focusColor: accent[100],
    },
    list: { focusBackground: surface[800] },
    mask: { background: 'rgba(0, 0, 0, 0.6)' },
    focusRing: { color: accent[400] },
    shadow: { ...shadows },
  };
}
