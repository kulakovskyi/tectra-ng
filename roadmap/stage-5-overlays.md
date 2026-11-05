# Stage 5 — overlays, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs and what the first consumer app needs (usage = bindings in its templates and call sites in its code, 2026-11-05).

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean. Panels are built on `TxOverlay` / `@tectra/core/overlay` (placements with flip, enter / leave motion, layers, sticky insets) and `@tectra/core/a11y`.

---

## 5.1 Tooltip — `ui/tooltip` ✅

PrimeNG: Tooltip (`pTooltip` text or template, `tooltipPosition`, `tooltipEvent` hover / focus / both, `showDelay`, `hideDelay`, `life`, `autoHide`, `tooltipDisabled`, `tooltipStyleClass`, `appendTo`, `escape`, `fitContent`, `hideOnEscape`, `positionTop` / `positionLeft`). First app: about 790 tooltips — on buttons (~690), icons (~50), status icons, tags, tabs, table cells; positions `top` (most), `bottom`, `left`, `right`; `tooltipDisabled` 4; keep open while hovered 2; own class 3 (one multi-line); one template (a list of roles); a truncated text with the full text in a tooltip.

- [x] `[txTooltip]` directive: text (multi-line with `\n`) or `TemplateRef` with `tooltipContext` (`$implicit`, `close`); 12 placements with flip (`tooltipPlacement`, default `top`), `tooltipOffset`, arrow pointing at the middle of the element (`tooltipArrow`)
- [x] Triggers: `tooltipEvent` hover / focus / both (keyboard focus only) / manual (`show()` / `hide()` / `toggle()` through `#ref="txTooltip"`); `tooltipShowDelay` / `tooltipHideDelay` / `tooltipLife`; skips the delay while another tooltip was just open; hides on press until the pointer leaves; `(tooltipShown)` / `(tooltipHidden)`
- [x] WCAG 1.4.13: dismissable with Escape, hoverable (`tooltipInteractive`, default on), persistent while hovered or focused
- [x] Accessible: `role="tooltip"`; text tooltips describe the element (`aria-describedby` to a hidden text node, present before the tooltip shows) and name it when it has no name of its own (icon-only buttons); template tooltips are linked while open
- [x] `tooltipDisabled`, `tooltipOverflowOnly` (only when the text is truncated), `tooltipClass`, `provideTxTooltip()` for app-wide defaults; `dt` / `pt` / `ptOptions` / `unstyled` as `tooltipDt` / `tooltipPt` / `tooltipPtOptions` / `tooltipUnstyled` (the host element has its own `dt`)
- [x] Docs + tests: basic, placements, triggers, delays, template, interactive, disabled, overflow, on icon buttons, manual, design tokens; e2e: hover shows above the button with the arrow on its middle, keyboard focus shows and Escape hides, flip below a stuck tab bar, stays open on the tooltip, overflow only. Found on the way: `TxOverlay` measured component panels before they rendered and CDK compared top placements with the viewport edge instead of the sticky chrome — panels now render first and the first placement with room around the insets goes first (`orderByRoom`)

## 5.2 Popover — `ui/popover` ✅

PrimeNG: Popover (`toggle(event, target?)`, `show`, `hide`, `dismissable`, `appendTo`, `(onShow)`, `(onHide)`). First app: 16 places — a trigger + content wrapper with `(opened)` and `hide()` (notification bells, user menus, app switcher, table settings), plus direct use with `toggle(event, target)`, `dismissable`, `(onShow)` / `(onHide)` and own tokens.

- [x] `<tx-popover>` (content) + `[txPopoverTrigger]` directive: toggle on click, placements with flip, arrow, `[(open)]`, `show(target?)` / `hide()` / `toggle(event?, target?)`, `(opened)` / `(closed)`
- [x] Closes on outside click (`dismissable`), Escape and scroll-out; focus moves into the panel and back to the trigger; `aria-haspopup="dialog"` / `aria-expanded` / `aria-controls`
- [x] Header / footer slots, `closeButton`, width from content with `minWidth` / `maxWidth` tokens
- [x] Docs + tests: basic, placements, form inside, header / footer, programmatic target, nested (popover in popover), design tokens; e2e: focus in and back, outside click, Escape
- Found on the way: tabbable lookups skip `inert` areas (`tabbableElements`, `nextTabbable` in `@tectra/core/a11y`); the arrow offset is shared (`txArrowOffset`)


## 5.3 Toast — `ui/toast` + `TxToastService`

PrimeNG: Toast + MessageService (`add`, `addAll`, `clear(key)`, `severity`, `summary`, `detail`, `life`, `sticky`, `closable`, `key`, `position`, `icon`, templates). First app: one service used in ~200 files — `success` (~414 calls), `error` (37), `warning` (22), a sticky pending toast with a spinner and a Cancel action, messages are i18n keys with params; the toast sits at the bottom centre, the pending one at the top centre.

- [ ] `<tx-toast>` outlet: 6 positions, stacking with newest on top, enter / leave motion, `key` for several outlets
- [ ] `TxToastService`: `show(options)` + `success` / `info` / `warn` / `error` / `loading`, returns a `TxToastRef` (`close()`, `update()`, `closed`); `clear(key?)`; `life` (pauses on hover and focus), `sticky`, `closable`, title + text, icon per severity
- [ ] Actions: buttons in the toast (`actions: [{ label, run }]`, e.g. Undo / Cancel), progress of the remaining life
- [ ] Accessible: `role="status"` (polite) / `role="alert"` for errors, close button with a translated label, keyboard reachable actions; F6-free — focus never jumps into a toast
- [ ] Docs + tests: severities, positions, sticky, actions, loading → success, update, template, design tokens; e2e: auto close, hover pauses, stacking without layout shift

## 5.4 Dialog — `ui/dialog` + `TxDialog` service

PrimeNG: Dialog (`visible`, `header`, `modal`, `closable`, `dismissableMask`, `closeOnEscape`, `draggable`, `resizable`, `maximizable`, `position`, `breakpoints`, `blockScroll`, `focusOnShow`, `focusTrap`, header / footer templates) and DynamicDialog (`DialogService.open(component, config)`, `DynamicDialogRef.close(result)`, `onClose`, `DynamicDialogConfig.data`). First app: ~356 `open` calls with a component, data and a width (~94 set it; default 700px, narrower below 960px / 640px), the result is read from an observable (`'success'` or nothing); ~389 modal components read data through injection and close through the ref; no shared header — every modal draws its own title and close button.

- [ ] `TxDialog.open(component | template, { data, width, ... })` → `TxDialogRef<TResult>` (`close(result?)`, `closed` observable, `afterOpened`, `updateSize`), `TX_DIALOG_DATA` + `injectDialogData<T>()`, `injectDialogRef<R>()`; component inputs set from `inputs`
- [ ] Declarative `<tx-dialog [(visible)]>` for template dialogs, same look
- [ ] Layout parts: `<tx-dialog-header>` (title, subtitle, close button), `<tx-dialog-content>` (scrolls), `<tx-dialog-footer>` (actions, aligned end); `txDialogClose` directive (`[txDialogClose]="result"`)
- [ ] Options: `width` / `minWidth` / `maxWidth` / `breakpoints`, `size` presets (`small` / `medium` / `large` / `fullscreen`), `position` (center / top / …), `closable`, `closeOnEscape`, `dismissableMask`, `modal`, `blockScroll`, `draggable`, `maximizable`, `autoFocus` (first field / first button / dialog / selector), `restoreFocus`, `panelClass`, `ariaLabel`
- [ ] Stacking (dialog over dialog, Escape closes the top one), `closeAll()`, `canClose` guard (unsaved changes)
- [ ] Accessible: `role="dialog"` / `alertdialog`, `aria-modal`, `aria-labelledby` from the header title, focus trap, focus back to the opener, inert background
- [ ] Docs + tests: service with data and result, template dialog, sizes, positions, scrolling content, form in a dialog, nested, guard, maximizable, draggable, design tokens; e2e: focus trap, Escape, mask click, no layout shift of the page (scrollbar gutter)

## 5.5 Drawer — `ui/drawer`

PrimeNG: Drawer (`visible`, `position` left / right / top / bottom / full, `modal`, `dismissible`, `closeOnEscape`, `blockScroll`, `header`, `fullScreen`, templates). First app: 14 drawers — `[(visible)]`, `header`, a normal and a wide size, an optional footer slot; always right, modal, dismissable, Escape, block scroll.

- [ ] `<tx-drawer [(visible)]>`: positions left / right / top / bottom, `size` (`small` / `medium` / `large` / `full` or a CSS size), `header` text or slot, footer slot, close button
- [ ] `modal` with mask, `dismissable`, `closeOnEscape`, `blockScroll`, slide motion (fade with reduced motion); `TxDialog.open(…, { drawer: 'right' })` for drawers from code
- [ ] Accessible like the dialog (focus trap, `aria-modal`, named by the header, focus back)
- [ ] Docs + tests: positions, sizes, footer, form, non-modal, from code, design tokens; e2e: slides in, focus trap, Escape

## 5.6 Confirm — `ui/confirm-dialog`, `ui/confirm-popup` + `TxConfirm` service

PrimeNG: ConfirmDialog / ConfirmPopup + ConfirmationService (`confirm({ header, message, icon, accept, reject, acceptLabel, rejectLabel, acceptButtonProps, defaultFocus, target })`). First app: one confirm modal (title, description, confirm / cancel labels, confirm severity — danger by default, an icon) and ~100 bespoke delete / remove / archive / cancel / revoke modals that are the same shape.

- [ ] `TxConfirm.dialog({ title, message, icon, severity, acceptLabel, rejectLabel, acceptIcon, defaultFocus })` → `Promise<boolean>` / observable; async `accept` with a loading button that closes when it resolves
- [ ] `TxConfirm.popup(target, { … })` — the same next to the element, with an arrow
- [ ] Translated default labels (us / ua "Confirm", "Cancel", "Delete"), `role="alertdialog"`, focus on the safe button by default
- [ ] Docs + tests: delete, severities, async accept, popup, custom content, design tokens; e2e: keyboard confirm, focus back

## 5.7 Menus — `ui/menu` (popup + inline), `ui/tiered-menu`, `ui/context-menu`

PrimeNG: Menu, TieredMenu, ContextMenu (`model: MenuItem[]` — `label`, `icon`, `command`, `routerLink`, `url`, `disabled`, `visible`, `separator`, `items`, `badge`, `styleClass`; `popup`, `toggle(event)`, item template). First app: an actions menu behind an ellipsis button (`id`, `label`, `icon`, `danger`, `(itemSelect)` with the id), table row actions that overflow into a menu, a row context menu built from the same actions with item templates.

- [ ] `TxMenuItem` model (`id`, `label`, `icon`, `command`, `routerLink` + extras, `url` + `target`, `disabled`, `visible`, `separator`, `severity` (danger), `badge`, `shortcut`, `items`, `data`), item template slot
- [ ] `<tx-menu>` inline and popup (`[txMenuTrigger]` on any button), groups with headers, `(itemSelected)`
- [ ] `<tx-tiered-menu>` with sub-menus (hover intent, arrow keys), `<tx-context-menu>` on `(contextmenu)` of a target or globally
- [ ] Keyboard (WAI-ARIA menu / menubar): arrows, Home / End, type-ahead, Enter / Space, Escape / Left closes a level, Tab closes; `role="menu"` / `menuitem`, `aria-haspopup`, `aria-expanded`
- [ ] Docs + tests: inline, popup, groups, icons and shortcuts, danger item, router links, nested, context menu on a table row, template, design tokens; e2e: keyboard path, sub-menu flip at the viewport edge

## 5.8 Split button + speed dial — `ui/split-button`, `ui/speed-dial`

PrimeNG: SplitButton (`label`, `icon`, `model`, `severity`, `(onClick)`, `(onDropdownClick)`, `menuButtonProps`), SpeedDial (`model`, `direction`, `type` linear / circle / semi-circle / quarter-circle, `radius`, `mask`, `hideOnClickOutside`). First app: none (parity).

- [ ] `<tx-split-button>`: main action + menu button (`tx-menu` popup), severities, variants and sizes from `txButton`, disabled parts
- [ ] `<tx-speed-dial>`: linear (4 directions) and circle / semi / quarter layouts, mask, tooltips on items, keyboard
- [ ] Docs + tests: every variant, keyboard, design tokens
