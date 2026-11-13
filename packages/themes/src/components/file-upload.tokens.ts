import { joinCss, lightDark, mix, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-file-upload`: colors, sizes and spacing of its root, dropzone, icon, prompt, hint and
 * other parts.
 */
export const fileUploadTokens = {
  root: {
    gap: '10.5px',
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    transitionDuration: '0.2s',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
    focusRingOffset: '2px',
  },
  dropzone: {
    minHeight: '205px',
    padding: '28px 21px',
    gap: '12.25px',
    borderRadius: tokenRef('radius-xl'),
    borderWidth: '1.5px',
    dash: '7px 6px',
    dashPeriod: '13px',
    borderColor: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    hoverBorderColor: mix(tokenRef('primary-base'), '55%', tokenRef('surface-card')),
    activeBorderColor: tokenRef('primary-base'),
    invalidBorderColor: tokenRef('danger-base'),
    background: mix(tokenRef('text-primary'), '2.5%', tokenRef('surface-card')),
    hoverBackground: mix(tokenRef('primary-base'), '4%', tokenRef('surface-card')),
    activeBackground: mix(tokenRef('primary-base'), '8%', tokenRef('surface-card')),
    disabledOpacity: '0.6',
  },
  icon: {
    size: '44px',
    glyphSize: '19.25px',
    borderRadius: tokenRef('radius-lg'),
    background: mix(tokenRef('primary-base'), '12%', tokenRef('surface-card')),
    color: tokenRef('primary-base'),
    hoverShadow: joinCss('0 6px 14px -6px ', mix(tokenRef('primary-base'), '55%', 'transparent')),
    lift: '-2px',
  },
  prompt: {
    fontWeight: tokenRef('font-weight-medium'),
    linkColor: tokenRef('primary-base'),
    linkFontWeight: tokenRef('font-weight-semibold'),
  },
  hint: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
  },
  list: {
    gap: '7px',
  },
  file: {
    padding: '10.5px 12.25px',
    gap: '12.25px',
    borderRadius: tokenRef('radius-lg'),
    borderColor: tokenRef('surface-border'),
    background: tokenRef('surface-card'),
    nameFontWeight: tokenRef('font-weight-medium'),
    metaColor: tokenRef('text-muted'),
    metaFontSize: tokenRef('font-size-sm'),
    metaGap: '4px',
    successColor: tokenRef('success-base'),
    errorColor: tokenRef('danger-base'),
  },
  thumbnail: {
    size: '40px',
    borderRadius: tokenRef('radius-md'),
    background: mix(tokenRef('text-primary'), '6%', tokenRef('surface-card')),
    color: tokenRef('text-muted'),
    glyphSize: '17.5px',
    extensionFontSize: '8.75px',
    largeSize: '56px',
    largeBorderRadius: tokenRef('radius-lg'),
    largeGlyphSize: '24.5px',
    largeExtensionFontSize: '10.5px',
    imageColor: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    documentColor: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    pdfColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    sheetColor: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    archiveColor: lightDark(tokenRef('orange-600'), tokenRef('orange-400')),
    tint: '12%',
  },
  progress: {
    height: '3px',
    marginTop: '6px',
    background: mix(tokenRef('text-primary'), '8%', tokenRef('surface-card')),
    color: tokenRef('primary-base'),
    successColor: tokenRef('success-base'),
    errorColor: tokenRef('danger-base'),
  },
  message: {
    padding: '8.75px 12.25px',
    gap: '8.75px',
    borderRadius: tokenRef('radius-lg'),
    background: mix(tokenRef('danger-base'), '9%', tokenRef('surface-card')),
    color: tokenRef('danger-base'),
    fontSize: tokenRef('font-size-sm'),
  },
  footer: {
    gap: '10.5px',
    summaryColor: tokenRef('text-muted'),
    summaryFontSize: tokenRef('font-size-sm'),
  },
  selected: {
    gap: '8.75px',
    background: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    progressWidth: '240px',
    actionsGap: '3.5px',
  },
  basic: {
    gap: '10.5px',
    labelColor: tokenRef('text-muted'),
    labelFontSize: tokenRef('font-size-sm'),
  },
};

/** Type of `fileUploadTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraFileUploadTokens = typeof fileUploadTokens;
