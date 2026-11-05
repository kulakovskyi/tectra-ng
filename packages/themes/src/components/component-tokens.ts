import { badgeTokens } from './badge.tokens';
import { buttonTokens } from './button.tokens';
import { checkboxTokens } from './checkbox.tokens';
import { formFieldTokens } from './form-field.tokens';
import { inputGroupTokens } from './input-group.tokens';
import { inputOtpTokens } from './input-otp.tokens';
import { floatLabelTokens, iftaLabelTokens, labelTokens } from './label.tokens';
import { fieldTokens } from './field.tokens';
import { fieldMessageTokens, messageTokens } from './message.tokens';
import { passwordTokens } from './password.tokens';
import { radioButtonTokens } from './radio-button.tokens';
import { selectTokens } from './select.tokens';
import { textareaTokens } from './textarea.tokens';
import { iconTokens } from './icon.tokens';
import { rippleTokens } from './ripple.tokens';
import { toggleButtonTokens } from './toggle-button.tokens';
import { toggleSwitchTokens } from './toggle-switch.tokens';

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
  message: messageTokens,
  fieldMessage: fieldMessageTokens,
  field: fieldTokens,
  textarea: textareaTokens,
  checkbox: checkboxTokens,
  radioButton: radioButtonTokens,
  toggleSwitch: toggleSwitchTokens,
  password: passwordTokens,
  inputOtp: inputOtpTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
