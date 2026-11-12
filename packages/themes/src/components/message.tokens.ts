import { fade, lightDark, tokenRef } from './token-helpers';

/* @__NO_SIDE_EFFECTS__ */
function tone(palette: string) {
  return {
    tone: lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`)),
    text: lightDark(tokenRef(`${palette}-700`), tokenRef(`${palette}-400`)),
  };
}

export const messageTokens = {
  root: {
    borderRadius: tokenRef('radius-lg'),
    borderColor: tokenRef('surface-border'),
    borderTint: '30%',
    borderWidth: '1px',
    outlinedBorderWidth: '1px',
    background: tokenRef('surface-card'),
    backgroundTint: '7%',
    color: tokenRef('text-primary'),
    gap: '12px',
    paddingY: '10px',
    paddingStart: '16px',
    paddingEnd: '12px',
    fontSize: '13px',
    fontWeight: tokenRef('font-weight-regular'),
    lineHeight: '1.5',
    accentWidth: '4px',
    transitionDuration: '0.2s',
  },
  icon: { size: '28px', fontSize: '14px', tint: '15%' },
  closeButton: {
    size: '26px',
    borderRadius: tokenRef('radius-md'),
    color: tokenRef('text-muted'),
    hoverColor: tokenRef('text-primary'),
    hoverBackground: fade(tokenRef('text-primary'), '92%'),
    fontSize: '14px',
    focusRingWidth: '2px',
    focusRingOffset: '1px',
    focusRingShadow: 'none',
  },
  sm: { gap: '10px', paddingY: '8px', paddingStart: '14px', paddingEnd: '10px', fontSize: '12px', iconSize: '24px', iconFontSize: '12px' },
  lg: { gap: '14px', paddingY: '14px', paddingStart: '20px', paddingEnd: '16px', fontSize: '14px', iconSize: '36px', iconFontSize: '17px' },
  primary: tone('primary'),
  info: tone('sky'),
  success: tone('green'),
  warn: tone('orange'),
  danger: tone('red'),
  help: tone('purple'),
  secondary: { tone: tokenRef('text-muted'), text: tokenRef('text-muted') },
  contrast: { tone: tokenRef('text-primary'), text: tokenRef('text-primary') },
};

export const fieldMessageTokens = {
  root: {
    fontSize: tokenRef('font-size-sm'),
    lineHeight: '1.4',
    gap: '6px',
    marginTop: '6px',
    iconSize: '12px',
    transitionDuration: '0.2s',
  },
  hint: { color: tokenRef('text-muted') },
  success: { color: lightDark(tokenRef('green-700'), tokenRef('green-400')) },
  error: { color: lightDark(tokenRef('red-700'), tokenRef('red-400')) },
};

export type TectraMessageTokens = typeof messageTokens;
export type TectraFieldMessageTokens = typeof fieldMessageTokens;
