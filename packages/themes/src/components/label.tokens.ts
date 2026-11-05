import { tokenRef } from './token-helpers';

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

export type TectraLabelTokens = typeof labelTokens;
export type TectraFloatLabelTokens = typeof floatLabelTokens;
export type TectraIftaLabelTokens = typeof iftaLabelTokens;
