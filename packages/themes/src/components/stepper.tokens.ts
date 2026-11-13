import { fade, lightDark, mix, tokenRef } from './token-helpers';

const numberShadow = '0px 0.5px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.12)';

const focusRing = {
  width: '2px',
  style: 'solid',
  color: tokenRef('focus-ring-color'),
  offset: '2px',
  shadow: 'none',
};

/**
 * Design tokens of `tx-stepper`: colors, sizes and spacing of its root, separator, step, step header, step
 * title and other parts.
 */
export const stepperTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
    panelTransitionDuration: '0.25s',
  },
  separator: {
    background: tokenRef('surface-border'),
    activeBackground: tokenRef('primary-base'),
    margin: '0 0 0 19.25px',
    size: '2px',
  },
  step: {
    padding: '5.25px',
    gap: '12.25px',
  },
  stepHeader: {
    padding: '0',
    borderRadius: tokenRef('radius-lg'),
    gap: '7px',
    disabledOpacity: '0.6',
    focusRing,
  },
  stepTitle: {
    color: tokenRef('text-muted'),
    activeColor: tokenRef('primary-base'),
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
  },
  stepNumber: {
    background: tokenRef('surface-card'),
    activeBackground: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    activeBorderColor: tokenRef('surface-border'),
    borderWidth: '2px',
    color: tokenRef('text-muted'),
    activeColor: tokenRef('primary-base'),
    size: '28px',
    fontSize: '14px',
    fontWeight: tokenRef('font-weight-medium'),
    borderRadius: '50%',
    shadow: numberShadow,
  },
  steppanels: {
    padding: '10.5px 5.25px 14px 5.25px',
  },
  steppanel: {
    background: 'transparent',
    color: tokenRef('text-primary'),
    padding: '0',
    indent: '12.25px',
  },
};

/**
 * Design tokens of `tx-steps`: colors, sizes and spacing of its root, separator, item link, item label, item
 * number and other parts.
 */
export const stepsTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
  },
  separator: {
    background: tokenRef('surface-border'),
    size: '2px',
  },
  itemLink: {
    borderRadius: tokenRef('radius-lg'),
    gap: '7px',
    focusRing,
  },
  itemLabel: {
    color: tokenRef('text-muted'),
    activeColor: tokenRef('primary-base'),
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
  },
  itemNumber: {
    background: tokenRef('surface-card'),
    activeBackground: tokenRef('surface-card'),
    borderColor: tokenRef('surface-border'),
    activeBorderColor: tokenRef('surface-border'),
    borderWidth: '2px',
    color: tokenRef('text-muted'),
    activeColor: tokenRef('primary-base'),
    size: '28px',
    fontSize: '16px',
    fontWeight: tokenRef('font-weight-medium'),
    borderRadius: '50%',
    shadow: numberShadow,
  },
  track: {
    gap: '7px',
    buttonPadding: '5.25px 7px',
    buttonGap: '10.5px',
    buttonBorderRadius: tokenRef('radius-md'),
    buttonHoverBackground: tokenRef('surface-hover'),
    textGap: '1.75px',
    markerSize: '31.5px',
    markerFontSize: '12.25px',
    markerFontWeight: tokenRef('font-weight-semibold'),
    markerBackground: tokenRef('surface-ground'),
    markerColor: tokenRef('text-muted'),
    markerBorderColor: tokenRef('surface-border'),
    markerBorderWidth: '1px',
    labelFontSize: '12.25px',
    labelFontWeight: tokenRef('font-weight-semibold'),
    labelColor: tokenRef('text-muted'),
    descriptionFontSize: '10.5px',
    descriptionColor: tokenRef('text-muted'),
    lineSize: '1px',
    lineMargin: '14px',
    lineMinWidth: '28px',
    lineBackground: tokenRef('surface-border'),
    doneLineBackground: mix(tokenRef('green-500'), '45%', tokenRef('surface-border')),
    doneMarkerBackground: fade(tokenRef('green-500'), '86%'),
    doneMarkerColor: lightDark(tokenRef('green-600'), tokenRef('green-400')),
    doneMarkerBorderColor: fade(tokenRef('green-500'), '70%'),
    doneLabelColor: tokenRef('text-primary'),
    activeMarkerBackground: tokenRef('primary-base'),
    activeMarkerColor: tokenRef('primary-contrast'),
    activeLabelColor: tokenRef('primary-base'),
    buttonOffset: '-7px',
    disabledOpacity: '0.6',
  },
};

/** Type of `stepperTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraStepperTokens = typeof stepperTokens;
/** Type of `stepsTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export type TectraStepsTokens = typeof stepsTokens;
