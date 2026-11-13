import { lightDark, tokenRef } from './token-helpers';

const focusRing = { width: '2px', style: 'solid', color: tokenRef('focus-ring-color'), offset: '2px', shadow: 'none' };

/**
 * Design tokens of `tx-datepicker`: colors, sizes and spacing of its root, panel, header, title, dropdown and
 * other parts.
 */
export const datePickerTokens = {
  root: {
    transitionDuration: tokenRef('motion-duration'),
  },
  panel: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    color: tokenRef('text-primary'),
    borderRadius: tokenRef('radius-lg'),
    shadow: tokenRef('shadow-overlay'),
    padding: '10.5px',
  },
  header: {
    background: tokenRef('surface-overlay'),
    borderColor: tokenRef('surface-overlay-border'),
    color: tokenRef('text-primary'),
    padding: '0 0 7px 0',
  },
  title: {
    gap: '7px',
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
  },
  dropdown: {
    width: '31.5px',
    sm: { width: '24.5px' },
    lg: { width: '36.75px' },
    background: lightDark(tokenRef('surface-100'), tokenRef('surface-800')),
    hoverBackground: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    activeBackground: lightDark(tokenRef('surface-300'), tokenRef('surface-600')),
    borderColor: tokenRef('form-field-border-color'),
    hoverBorderColor: tokenRef('form-field-border-color'),
    activeBorderColor: tokenRef('form-field-border-color'),
    color: lightDark(tokenRef('surface-600'), tokenRef('surface-300')),
    hoverColor: lightDark(tokenRef('surface-700'), tokenRef('surface-200')),
    activeColor: lightDark(tokenRef('surface-800'), tokenRef('surface-100')),
    borderRadius: tokenRef('form-field-border-radius'),
    focusRing,
  },
  inputIcon: {
    color: tokenRef('form-field-icon-color'),
  },
  selectMonth: {
    hoverBackground: tokenRef('surface-hover'),
    color: tokenRef('text-primary'),
    hoverColor: tokenRef('text-hover'),
    padding: '3.5px 7px',
    borderRadius: tokenRef('radius-lg'),
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
  },
  selectYear: {
    hoverBackground: tokenRef('surface-hover'),
    color: tokenRef('text-primary'),
    hoverColor: tokenRef('text-hover'),
    padding: '3.5px 7px',
    borderRadius: tokenRef('radius-lg'),
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
  },
  group: {
    borderColor: tokenRef('surface-overlay-border'),
    gap: '10.5px',
  },
  dayView: {
    margin: '7px 0 0 0',
  },
  weekDay: {
    padding: '3.5px',
    fontWeight: tokenRef('font-weight-medium'),
    fontSize: tokenRef('font-size-md'),
    color: tokenRef('text-primary'),
  },
  weekNumber: {
    color: tokenRef('text-muted'),
    fontSize: tokenRef('font-size-sm'),
  },
  date: {
    fontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('font-size-md'),
    hoverBackground: tokenRef('surface-hover'),
    selectedBackground: tokenRef('primary-base'),
    rangeSelectedBackground: tokenRef('highlight-background'),
    color: tokenRef('text-primary'),
    hoverColor: tokenRef('text-hover'),
    selectedColor: tokenRef('primary-contrast'),
    rangeSelectedColor: tokenRef('highlight-color'),
    disabledOpacity: '0.6',
    width: '24.5px',
    height: '24.5px',
    borderRadius: '50%',
    padding: '3.5px',
    focusRing,
  },
  monthView: {
    margin: '7px 0 0 0',
  },
  month: {
    padding: '3.5px',
    borderRadius: tokenRef('radius-lg'),
  },
  yearView: {
    margin: '7px 0 0 0',
  },
  year: {
    padding: '3.5px',
    borderRadius: tokenRef('radius-lg'),
  },
  buttonbar: {
    padding: '7px 0 0 0',
    borderColor: tokenRef('surface-overlay-border'),
  },
  timePicker: {
    padding: '7px 0 0 0',
    borderColor: tokenRef('surface-overlay-border'),
    gap: '7px',
    buttonGap: '1.75px',
    color: tokenRef('text-primary'),
    fontWeight: tokenRef('font-weight-regular'),
    fontSize: tokenRef('font-size-md'),
  },
  today: {
    background: lightDark(tokenRef('surface-200'), tokenRef('surface-700')),
    color: lightDark(tokenRef('surface-900'), tokenRef('surface-0')),
  },
  touch: {
    maskBackground: tokenRef('mask-background'),
    width: 'min(92vw, 360px)',
  },
};

type DatePickerTokensShape = typeof datePickerTokens;

/** Type of `datePickerTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraDatePickerTokens extends DatePickerTokensShape {}
