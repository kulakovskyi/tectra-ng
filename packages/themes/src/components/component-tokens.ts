import { avatarTokens } from './avatar.tokens';
import { badgeTokens } from './badge.tokens';
import { buttonTokens } from './button.tokens';
import { checkboxTokens } from './checkbox.tokens';
import { formFieldTokens } from './form-field.tokens';
import { inputGroupTokens } from './input-group.tokens';
import { inputNumberTokens } from './input-number.tokens';
import { inputOtpTokens } from './input-otp.tokens';
import { knobTokens } from './knob.tokens';
import { floatLabelTokens, iftaLabelTokens, labelTokens } from './label.tokens';
import { fieldTokens } from './field.tokens';
import { fieldMessageTokens, messageTokens } from './message.tokens';
import { overlayBadgeTokens } from './overlay-badge.tokens';
import { passwordTokens } from './password.tokens';
import { pillTokens } from './pill.tokens';
import { progressBarTokens, progressSpinnerTokens } from './progress.tokens';
import { radioButtonTokens } from './radio-button.tokens';
import { ratingTokens } from './rating.tokens';
import { selectTokens } from './select.tokens';
import { chipsInputTokens, colorPickerTokens, countryTokens, listboxTokens, mentionTokens, treeTokens } from './selection.tokens';
import { skeletonTokens } from './skeleton.tokens';
import { sliderTokens } from './slider.tokens';
import { chipTokens, tagTokens } from './tag.tokens';
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
  listbox: listboxTokens,
  chipsInput: chipsInputTokens,
  country: countryTokens,
  colorPicker: colorPickerTokens,
  mention: mentionTokens,
  tree: treeTokens,
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
  inputNumber: inputNumberTokens,
  rating: ratingTokens,
  knob: knobTokens,
  slider: sliderTokens,
  overlayBadge: overlayBadgeTokens,
  pill: pillTokens,
  tag: tagTokens,
  chip: chipTokens,
  progressBar: progressBarTokens,
  progressSpinner: progressSpinnerTokens,
  skeleton: skeletonTokens,
  avatar: avatarTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
