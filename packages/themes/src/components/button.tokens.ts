import { fade, lightDark, mix, tokenRef } from './token-helpers';

function solid(group: string) {
  return {
    background: tokenRef(`${group}-base`),
    hoverBackground: tokenRef(`${group}-hover`),
    activeBackground: tokenRef(`${group}-active`),
    borderColor: tokenRef(`${group}-base`),
    hoverBorderColor: tokenRef(`${group}-hover`),
    activeBorderColor: tokenRef(`${group}-active`),
    color: tokenRef(`${group}-contrast`),
    hoverColor: tokenRef(`${group}-contrast`),
    activeColor: tokenRef(`${group}-contrast`),
    focusRing: { color: tokenRef(`${group}-base`), shadow: 'none' },
  };
}

function outlined(palette: string, color: string) {
  return {
    hoverBackground: lightDark(tokenRef(`${palette}-50`), mix(tokenRef(`${palette}-400`), '8%', tokenRef('surface-900'))),
    activeBackground: lightDark(tokenRef(`${palette}-100`), mix(tokenRef(`${palette}-400`), '18%', tokenRef('surface-900'))),
    borderColor: lightDark(tokenRef(`${palette}-200`), tokenRef(`${palette}-700`)),
    color,
  };
}

function text(palette: string, color: string) {
  return {
    hoverBackground: lightDark(tokenRef(`${palette}-50`), fade(tokenRef(`${palette}-400`), '96%')),
    activeBackground: lightDark(tokenRef(`${palette}-100`), fade(tokenRef(`${palette}-400`), '84%')),
    color,
  };
}

const severityColor = (palette: string) => lightDark(tokenRef(`${palette}-600`), tokenRef(`${palette}-400`));

export const buttonTokens = {
  root: {
    borderRadius: tokenRef('radius-md'),
    roundedBorderRadius: '2rem',
    gap: '8px',
    paddingX: '12px',
    paddingY: '9px',
    iconOnlyWidth: '37px',
    fontSize: tokenRef('font-size-md'),
    lineHeight: '17px',
    sm: { fontSize: tokenRef('font-size-sm'), lineHeight: '16px', paddingX: '10px', paddingY: '6px', iconOnlyWidth: '30px' },
    lg: { fontSize: tokenRef('font-size-lg'), lineHeight: '20px', paddingX: '14px', paddingY: '11px', iconOnlyWidth: '44px' },
    label: { fontWeight: tokenRef('font-weight-semibold') },
    raisedShadow: '0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12)',
    focusRing: { width: '2px', style: 'solid', offset: '2px' },
    badgeSize: '18px',
    transitionDuration: tokenRef('motion-duration'),
    primary: solid('primary'),
    secondary: {
      background: tokenRef('secondary-base'),
      hoverBackground: tokenRef('secondary-hover'),
      activeBackground: tokenRef('secondary-active'),
      borderColor: tokenRef('secondary-border'),
      hoverBorderColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
      activeBorderColor: lightDark(tokenRef('surface-400'), tokenRef('surface-500')),
      color: tokenRef('secondary-contrast'),
      hoverColor: lightDark(tokenRef('surface-900'), tokenRef('surface-0')),
      activeColor: lightDark(tokenRef('surface-950'), tokenRef('surface-0')),
      focusRing: { color: lightDark(tokenRef('surface-600'), tokenRef('surface-300')), shadow: 'none' },
    },
    info: solid('info'),
    success: solid('success'),
    warn: solid('warn'),
    help: solid('help'),
    danger: solid('danger'),
    contrast: solid('contrast'),
  },
  outlined: {
    primary: outlined('primary', tokenRef('primary-base')),
    secondary: {
      hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      borderColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
      color: lightDark(tokenRef('surface-800'), tokenRef('surface-100')),
    },
    success: outlined('green', severityColor('green')),
    info: outlined('sky', lightDark(tokenRef('sky-700'), tokenRef('sky-400'))),
    warn: outlined('orange', lightDark(tokenRef('orange-700'), tokenRef('orange-400'))),
    help: outlined('purple', severityColor('purple')),
    danger: outlined('red', severityColor('red')),
    contrast: {
      hoverBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
      borderColor: lightDark(tokenRef('surface-700'), tokenRef('surface-500')),
      color: lightDark(tokenRef('surface-950'), tokenRef('surface-0')),
    },
    plain: {
      hoverBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
      borderColor: lightDark(tokenRef('surface-200'), tokenRef('surface-600')),
      color: lightDark(tokenRef('surface-700'), tokenRef('surface-0')),
    },
  },
  text: {
    primary: text('primary', tokenRef('primary-base')),
    secondary: {
      hoverBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
      color: lightDark(tokenRef('surface-700'), tokenRef('surface-200')),
    },
    success: text('green', severityColor('green')),
    info: text('sky', lightDark(tokenRef('sky-700'), tokenRef('sky-400'))),
    warn: text('orange', lightDark(tokenRef('orange-700'), tokenRef('orange-400'))),
    help: text('purple', severityColor('purple')),
    danger: text('red', severityColor('red')),
    contrast: {
      hoverBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
      color: lightDark(tokenRef('surface-950'), tokenRef('surface-0')),
    },
    plain: {
      hoverBackground: lightDark(tokenRef('surface-50'), tokenRef('surface-800')),
      activeBackground: lightDark(tokenRef('surface-100'), tokenRef('surface-700')),
      color: lightDark(tokenRef('surface-700'), tokenRef('surface-0')),
    },
  },
  link: {
    color: tokenRef('primary-base'),
    hoverColor: tokenRef('primary-hover'),
    activeColor: tokenRef('primary-active'),
  },
};

export type TectraButtonTokens = typeof buttonTokens;
