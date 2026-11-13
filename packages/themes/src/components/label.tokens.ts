import { tokenRef } from './token-helpers';

/** Design tokens of `tx-label`: colors, sizes and spacing of its root and subtle. */
export const labelTokens = {
  root: {
    color: tokenRef('text-primary'),
    fontSize: tokenRef('font-size-md'),
    fontWeight: tokenRef('font-weight-semibold'),
    gap: '4px',
    marginBottom: '6px',
    requiredColor: tokenRef('danger-base'),
    hintColor: tokenRef('text-muted'),
  },
  subtle: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
    fontWeight: tokenRef('font-weight-semibold'),
  },
};

/** Design tokens of `tx-float-label`: colors, sizes and spacing of its root, over, in and on. */
export const floatLabelTokens = {
  root: {
    color: tokenRef('form-field-placeholder-color'),
    focusColor: tokenRef('primary-base'),
    activeColor: tokenRef('text-muted'),
    invalidColor: tokenRef('danger-base'),
    transitionDuration: '0.2s',
    positionX: tokenRef('form-field-padding-x'),
    positionY: tokenRef('form-field-padding-y'),
    fontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('form-field-font-size'),
    active: { fontSize: '11px', fontWeight: tokenRef('font-weight-medium') },
  },
  over: { active: { top: '-18px' } },
  in: { input: { paddingTop: '22px', paddingBottom: '6px' }, active: { top: '6px' } },
  on: { borderRadius: tokenRef('radius-xs'), active: { background: tokenRef('form-field-background'), padding: '0 4px' } },
};

/** Design tokens of `tx-ifta-label`: colors, sizes and spacing of its root and input. */
export const iftaLabelTokens = {
  root: {
    color: tokenRef('text-muted'),
    focusColor: tokenRef('primary-base'),
    invalidColor: tokenRef('danger-base'),
    transitionDuration: '0.2s',
    positionX: tokenRef('form-field-padding-x'),
    top: '6px',
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: '11px',
  },
  input: { paddingTop: '22px', paddingBottom: '6px' },
};

type LabelTokensShape = typeof labelTokens;

/** Type of `labelTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraLabelTokens extends LabelTokensShape {}
type FloatLabelTokensShape = typeof floatLabelTokens;

/** Type of `floatLabelTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraFloatLabelTokens extends FloatLabelTokensShape {}
type IftaLabelTokensShape = typeof iftaLabelTokens;

/** Type of `iftaLabelTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraIftaLabelTokens extends IftaLabelTokensShape {}
