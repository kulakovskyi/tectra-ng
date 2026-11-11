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
import { amountTokens, highlightTextTokens, iconLinkTokens, linkTokens, statusIconTokens, truncateTextTokens } from './text.tokens';
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
import { analogClockTokens, countdownTokens, dataViewTokens, sparklineTokens, statTileTokens, statTilesTokens, timelineTokens, virtualScrollerTokens } from './data.tokens';
import { skeletonTokens } from './skeleton.tokens';
import { sliderTokens } from './slider.tokens';
import { chipTokens, tagTokens } from './tag.tokens';
import { textareaTokens } from './textarea.tokens';
import { listInputTokens } from './list-input.tokens';
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
import { datePickerTokens } from './datepicker.tokens';
import { monthCalendarTokens } from './month-calendar.tokens';
import { tabsTokens } from './tabs.tokens';
import { menubarTokens } from './menubar.tokens';
import { accordionTokens } from './accordion.tokens';
import { stepperTokens, stepsTokens } from './stepper.tokens';
import { breadcrumbTokens } from './breadcrumb.tokens';
import { panelMenuTokens } from './panel-menu.tokens';
import { scrollPanelTokens } from './scroll-panel.tokens';
import { splitterTokens } from './splitter.tokens';
import { toolbarTokens } from './toolbar.tokens';
import { fileUploadTokens } from './file-upload.tokens';
import { editorContentTokens, editorTokens } from './editor.tokens';
import { codeDiffTokens, codeEditorTokens, codeHighlightTokens, codeSyntaxTokens } from './code-editor.tokens';
import { imageTokens } from './image.tokens';
import { galleriaTokens } from './galleria.tokens';
import { carouselTokens } from './carousel.tokens';
import { filtersPanelTokens } from './filters-panel.tokens';
import { pageHeaderTokens } from './page-header.tokens';
import { emptyStateTokens } from './empty-state.tokens';
import { appFooterTokens } from './app-footer.tokens';
import { consoleLayoutTokens } from './console-layout.tokens';
import { appLayoutTokens } from './app-layout.tokens';
import { wizardTokens } from './wizard.tokens';
import { pinnedTabsTokens } from './pinned-tabs.tokens';
import { commandPaletteTokens } from './command-palette.tokens';
import { kanbanTokens } from './kanban.tokens';
import { actionsMenuTokens } from './actions-menu.tokens';
import { actionTileTokens } from './action-tile.tokens';
import { switchThemeTokens } from './switch-theme.tokens';
import { switchLanguageTokens } from './switch-language.tokens';
import { topbarPreferencesTokens } from './topbar-preferences.tokens';
import { publicHeaderTokens } from './public-header.tokens';
import { cookieNoticeTokens } from './cookie-notice.tokens';
import { networkStatusTokens } from './network-status.tokens';
import { qrCodeTokens } from './qr-code.tokens';
import { confettiTokens } from './confetti.tokens';
import { hoverEffectTokens } from './hover-effect.tokens';
import { mascotTokens } from './mascot.tokens';
import { chartTokens } from './chart.tokens';

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
  listInput: listInputTokens,
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
  truncateText: truncateTextTokens,
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
  sparkline: sparklineTokens,
  datePicker: datePickerTokens,
  monthCalendar: monthCalendarTokens,
  countdown: countdownTokens,
  analogClock: analogClockTokens,
  tabs: tabsTokens,
  menubar: menubarTokens,
  accordion: accordionTokens,
  stepper: stepperTokens,
  steps: stepsTokens,
  breadcrumb: breadcrumbTokens,
  panelMenu: panelMenuTokens,
  splitter: splitterTokens,
  scrollPanel: scrollPanelTokens,
  toolbar: toolbarTokens,
  fileUpload: fileUploadTokens,
  editor: editorTokens,
  editorContent: editorContentTokens,
  codeSyntax: codeSyntaxTokens,
  codeEditor: codeEditorTokens,
  codeHighlight: codeHighlightTokens,
  codeDiff: codeDiffTokens,
  image: imageTokens,
  galleria: galleriaTokens,
  carousel: carouselTokens,
  filtersPanel: filtersPanelTokens,
  pageHeader: pageHeaderTokens,
  emptyState: emptyStateTokens,
  appFooter: appFooterTokens,
  consoleLayout: consoleLayoutTokens,
  appLayout: appLayoutTokens,
  wizard: wizardTokens,
  pinnedTabs: pinnedTabsTokens,
  commandPalette: commandPaletteTokens,
  kanban: kanbanTokens,
  actionsMenu: actionsMenuTokens,
  actionTile: actionTileTokens,
  switchTheme: switchThemeTokens,
  switchLanguage: switchLanguageTokens,
  topbarPreferences: topbarPreferencesTokens,
  publicHeader: publicHeaderTokens,
  cookieNotice: cookieNoticeTokens,
  networkStatus: networkStatusTokens,
  qrCode: qrCodeTokens,
  confetti: confettiTokens,
  hoverEffect: hoverEffectTokens,
  mascot: mascotTokens,
  chart: chartTokens,
};

export type TectraComponentTokens = typeof COMPONENT_TOKENS;
