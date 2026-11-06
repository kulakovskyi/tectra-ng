import { avatarTokens } from './avatar.tokens';
import { badgeTokens } from './badge.tokens';
import { buttonTokens } from './button.tokens';
import { checkboxTokens } from './checkbox.tokens';
import { formFieldTokens } from './form-field.tokens';
import { inputGroupTokens } from './input-group.tokens';
import { inputNumberTokens } from './input-number.tokens';
import { inputOtpTokens } from './input-otp.tokens';
import { knobTokens } from './knob.tokens';
import { cardTokens, dividerTokens, fieldsetTokens, panelTokens } from './layout.tokens';
import { amountTokens, highlightTextTokens, iconLinkTokens, linkTokens, statusIconTokens } from './text.tokens';
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
import { cascadeSelectTokens, chipsInputTokens, colorPickerTokens, countryTokens, emailSuggestionTokens, listboxTokens, mentionTokens } from './selection.tokens';
import { treeTableTokens, treeTokens } from './tree.tokens';
import { dataViewTokens, statTileTokens, statTilesTokens, timelineTokens, virtualScrollerTokens } from './data.tokens';
import { skeletonTokens } from './skeleton.tokens';
import { sliderTokens } from './slider.tokens';
import { chipTokens, tagTokens } from './tag.tokens';
import { textareaTokens } from './textarea.tokens';
import { iconTokens } from './icon.tokens';
import { rippleTokens } from './ripple.tokens';
import { toggleButtonTokens } from './toggle-button.tokens';
import { toggleSwitchTokens } from './toggle-switch.tokens';
import { tooltipTokens } from './tooltip.tokens';
import { popoverTokens } from './popover.tokens';
import { toastTokens } from './toast.tokens';
import { dialogTokens } from './dialog.tokens';
import { confirmTokens } from './confirm.tokens';
import { menuTokens } from './menu.tokens';
import { splitButtonTokens } from './split-button.tokens';
import { speedDialTokens } from './speed-dial.tokens';
import { paginatorTokens } from './paginator.tokens';
import { tableTokens } from './table.tokens';

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
  cascadeSelect: cascadeSelectTokens,
  emailSuggestion: emailSuggestionTokens,
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
  divider: dividerTokens,
  card: cardTokens,
  panel: panelTokens,
  fieldset: fieldsetTokens,
  highlightText: highlightTextTokens,
  amount: amountTokens,
  statusIcon: statusIconTokens,
  link: linkTokens,
  iconLink: iconLinkTokens,
  tooltip: tooltipTokens,
  popover: popoverTokens,
  toast: toastTokens,
  dialog: dialogTokens,
  confirm: confirmTokens,
  menu: menuTokens,
  splitButton: splitButtonTokens,
  speedDial: speedDialTokens,
  paginator: paginatorTokens,
  table: tableTokens,
  treeTable: treeTableTokens,
  dataView: dataViewTokens,
  virtualScroller: virtualScrollerTokens,
  timeline: timelineTokens,
  statTiles: statTilesTokens,
  statTile: statTileTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
