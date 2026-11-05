import { badgeTokens } from './badge.tokens';
import { buttonTokens } from './button.tokens';
import { formFieldTokens } from './form-field.tokens';
import { inputGroupTokens } from './input-group.tokens';
import { floatLabelTokens, iftaLabelTokens, labelTokens } from './label.tokens';
import { selectTokens } from './select.tokens';
import { iconTokens } from './icon.tokens';
import { rippleTokens } from './ripple.tokens';
import { toggleButtonTokens } from './toggle-button.tokens';

export const COMPONENT_TOKENS = {
  icon: iconTokens,
  ripple: rippleTokens,
  formField: formFieldTokens,
  inputGroup: inputGroupTokens,
  label: labelTokens,
  floatLabel: floatLabelTokens,
  iftaLabel: iftaLabelTokens,
  button: buttonTokens,
  select: selectTokens,
  badge: badgeTokens,
  toggleButton: toggleButtonTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
