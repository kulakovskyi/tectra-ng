import { lightDark, tokenRef } from './token-helpers';

function tone(palette: string) {
  return {
    color: lightDark(tokenRef(`${palette}-800`), tokenRef(`${palette}-300`)),
    solidBackground: lightDark(tokenRef(`${palette}-700`), tokenRef(`${palette}-400`)),
    solidColor: lightDark(tokenRef('surface-0'), tokenRef('surface-950')),
  };
}

export const pillTokens = {
  root: {
    gap: '4px',
    paddingX: '8px',
    paddingY: '2px',
    borderRadius: tokenRef('radius-full'),
    fontSize: '12px',
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.4',
    tint: '12%',
    outlineBorderColor: tokenRef('surface-border'),
    outlineColor: tokenRef('text-primary'),
    iconSize: '0.9em',
    dotSize: '6px',
    removeSize: '16px',
    focusRingColor: tokenRef('focus-ring-color'),
  },
  sm: { fontSize: '11px', paddingX: '6px', paddingY: '1px' },
  lg: { fontSize: '13px', paddingX: '10px', paddingY: '3px', gap: '6px' },
  neutral: { color: tokenRef('text-muted'), solidBackground: lightDark(tokenRef('surface-600'), tokenRef('surface-400')), solidColor: lightDark(tokenRef('surface-0'), tokenRef('surface-950')) },
  primary: tone('primary'),
  success: tone('green'),
  info: tone('sky'),
  warn: tone('orange'),
  danger: tone('red'),
  help: tone('purple'),
  contrast: { color: tokenRef('text-primary'), solidBackground: tokenRef('text-primary'), solidColor: tokenRef('surface-card') },
};

export type TectraPillTokens = typeof pillTokens;
