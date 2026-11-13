import { joinCss, lightDark, mix, tokenRef } from './token-helpers';

/**
 * Design tokens of `tx-editor-content`: colors, sizes and spacing of its root, heading, link, list, task and
 * other parts.
 */
export const editorContentTokens = {
  root: {
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    lineHeight: '1.625',
    paragraphGap: '0',
    blockGap: '0.5em',
  },
  heading: {
    fontWeight: tokenRef('font-weight-semibold'),
    lineHeight: '1.3',
    spaceBefore: '0.6em',
    spaceAfter: '0.15em',
    h1Size: '1.75em',
    h2Size: '1.45em',
    h3Size: '1.225em',
    h4Size: '1.075em',
    h5Size: '1em',
    h6Size: '0.875em',
    h6Color: tokenRef('text-muted'),
  },
  link: {
    color: tokenRef('primary-base'),
    underlineColor: mix(tokenRef('primary-base'), '35%', 'transparent'),
    hoverUnderlineColor: tokenRef('primary-base'),
  },
  list: {
    indent: '1.5em',
    itemGap: '0.1em',
    markerColor: tokenRef('text-muted'),
  },
  task: {
    size: '16px',
    gap: '8.75px',
    borderRadius: tokenRef('radius-sm'),
    borderColor: tokenRef('form-field-border-color'),
    checkedBackground: tokenRef('primary-base'),
    checkedColor: tokenRef('primary-contrast'),
    doneColor: tokenRef('text-muted'),
  },
  quote: {
    borderWidth: '3px',
    borderColor: mix(tokenRef('primary-base'), '45%', tokenRef('surface-card')),
    padding: '0 0 0 14px',
    color: tokenRef('text-muted'),
  },
  code: {
    fontFamily: tokenRef('font-mono'),
    fontSize: '0.875em',
    padding: '0.15em 0.4em',
    borderRadius: tokenRef('radius-sm'),
    background: mix(tokenRef('text-primary'), '7%', tokenRef('surface-card')),
    color: tokenRef('text-primary'),
  },
  codeBlock: {
    padding: '12.25px 14px',
    borderRadius: tokenRef('radius-lg'),
    background: mix(tokenRef('text-primary'), '4.5%', tokenRef('surface-card')),
    borderColor: tokenRef('surface-border'),
    fontSize: '0.85em',
    lineHeight: '1.6',
  },
  rule: {
    color: tokenRef('surface-border'),
    spacing: '0.75em',
  },
  image: {
    borderRadius: tokenRef('radius-lg'),
    selectedOutline: joinCss('2px solid ', tokenRef('primary-base')),
  },
  video: {
    borderRadius: tokenRef('radius-lg'),
    aspectRatio: '16 / 9',
  },
  mention: {
    padding: '0.05em 0.35em',
    borderRadius: tokenRef('radius-sm'),
    background: mix(tokenRef('primary-base'), '12%', tokenRef('surface-card')),
    color: tokenRef('primary-base'),
    fontWeight: tokenRef('font-weight-medium'),
  },
  callout: {
    paddingBlock: '12.25px',
    paddingInlineEnd: '14px',
    paddingInlineStart: '42px',
    borderRadius: tokenRef('radius-lg'),
    tint: '10%',
    markerSize: '18px',
    markerStart: '14px',
    markerFontSize: '11px',
    infoColor: lightDark(tokenRef('sky-600'), tokenRef('sky-400')),
    successColor: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    warnColor: lightDark(tokenRef('orange-600'), tokenRef('orange-400')),
    dangerColor: lightDark(tokenRef('red-600'), tokenRef('red-400')),
    markerColor: tokenRef('surface-0'),
  },
  table: {
    borderColor: tokenRef('surface-border'),
    headerBackground: mix(tokenRef('text-primary'), '4%', tokenRef('surface-card')),
    cellPadding: '7px 10.5px',
  },
};

/**
 * Design tokens of `tx-editor`: colors, sizes and spacing of its root, toolbar, tool, ai, content and other
 * parts.
 */
export const editorTokens = {
  root: {
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('form-field-background'),
    transitionDuration: '0.2s',
    easing: 'cubic-bezier(0.2, 0, 0, 1)',
  },
  toolbar: {
    padding: '5.25px',
    gap: '1.75px',
    background: mix(tokenRef('text-primary'), '2.5%', tokenRef('form-field-background')),
    borderColor: tokenRef('surface-border'),
    separatorColor: tokenRef('surface-border'),
    separatorHeight: '17.5px',
    separatorSpacing: '3.5px',
  },
  tool: {
    size: '29.75px',
    borderRadius: tokenRef('radius-md'),
    iconSize: '15px',
    color: tokenRef('text-muted'),
    hoverBackground: mix(tokenRef('text-primary'), '7%', 'transparent'),
    hoverColor: tokenRef('text-primary'),
    activeBackground: mix(tokenRef('primary-base'), '13%', 'transparent'),
    activeColor: tokenRef('primary-base'),
    disabledOpacity: '0.4',
    labelFontSize: tokenRef('font-size-sm'),
    labelFontWeight: tokenRef('font-weight-medium'),
    labelPadding: '0 8.75px',
    focusRingWidth: '2px',
    focusRingColor: tokenRef('focus-ring-color'),
  },
  ai: {
    background: mix(tokenRef('primary-base'), '10%', 'transparent'),
    hoverBackground: mix(tokenRef('primary-base'), '17%', 'transparent'),
    color: tokenRef('primary-hover'),
    animationDuration: '3.2s',
  },
  content: {
    padding: '12.25px 15.75px',
    minHeight: '140px',
    placeholderColor: tokenRef('form-field-placeholder-color'),
  },
  footer: {
    padding: '5.25px 12.25px',
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-xs'),
    limitColor: tokenRef('danger-base'),
  },
  image: {
    handleWidth: '8px',
    handleHeight: '36px',
    handleBackground: tokenRef('surface-card'),
    handleBorderColor: tokenRef('primary-base'),
    handleShadow: tokenRef('shadow-overlay'),
    dropCursorColor: tokenRef('primary-base'),
  },
  bubble: {
    padding: '3.5px',
    gap: '1.75px',
    borderRadius: tokenRef('radius-lg'),
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    shadow: tokenRef('shadow-overlay'),
    offset: '8px',
    linkMaxWidth: '240px',
  },
  popover: {
    padding: '10.5px',
    gap: '8.75px',
    width: '300px',
  },
  swatch: {
    size: '22px',
    gap: '5.25px',
    borderRadius: tokenRef('radius-sm'),
    ring: mix(tokenRef('text-primary'), '14%', 'transparent'),
    selectedRing: tokenRef('primary-base'),
  },
  suggestion: {
    width: '264px',
    maxHeight: '260px',
    padding: '4px',
    itemPadding: '7px 10.5px',
    itemGap: '8.75px',
    itemRadius: tokenRef('radius-sm'),
    itemFocusBackground: tokenRef('list-focus-background'),
    avatarSize: '22px',
    secondaryColor: tokenRef('text-muted'),
  },
};

/** Type of `editorContentTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraEditorContentTokens = typeof editorContentTokens;
/** Type of `editorTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraEditorTokens = typeof editorTokens;
