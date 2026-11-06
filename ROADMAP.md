# tectra roadmap

Everything tectra covers, ordered by dependencies and by how much the first consumer app needs each part. We go top to bottom, one item at a time.

**Legend:** ✅ done · 🟡 started, not at parity · ⬜ to do

**Usage** = how many files of the first consumer app use the part (counted 2026-11-05). It is the main signal for priority inside a stage.

## Definition of done (every item)

1. Component in `packages/<pkg>/<name>` — signals, OnPush, standalone, keyboard + ARIA.
2. Design tokens in `packages/themes/src/components/<name>.tokens.ts`, light + dark.
3. `dt`, `pt` (+ `ptOptions`), `unstyled` where the component has parts.
4. Feature parity with the PrimeNG component of the same role (inputs, outputs, templates) — list in the README.
5. `README.md` (Inputs / Outputs / Slots / Keyboard) and docs content: overview + one example per feature.
6. Unit tests (once the test runner exists) and a Playwright check of the docs page (light + dark, no layout shifts).

---

## Stage 0 — foundation ✅

| Item | Package | Status |
|---|---|---|
| Tokens: ink surface, 5 accents, severity palettes, radius, typography, shadows | `@tectra-ng/tokens` | ✅ |
| Themes: light / dark semantic, `createTectraPreset(options)`, component tokens, deep `definePreset` | `@tectra-ng/themes` | ✅ |
| Theme picker: 17 primaries (`noir` follows the surface), 13 surfaces, 4 themes (`tectra` default, `soft`, `edge`, `paper`) via `createTectraPreset({ style, primary, surface })`, runtime ripple switch; docs header picker | `@tectra-ng/tokens`, `@tectra-ng/themes`, `@tectra-ng/core/config` | 🚧 |
| `provideTectra` (preset, mode, `darkSelector`, ripple, unstyled, pt, ptOptions), forms base, i18n, style loader, ripple, fluid | `@tectra-ng/core` | ✅ |
| 334 icons with PrimeIcons names + registry, brand logos | `@tectra-ng/icons`, `@tectra-ng/brand-icons` | ✅ |
| Docs site, registry builder, sandbox | `apps/docs` | ✅ |

## Stage 1 — infrastructure before the next components

| Item | Why now | Status |
|---|---|---|
| Unit tests: Vitest through `@angular/build:unit-test` (`npm run test`) — specs for themes, core, icons, badge, button, button-group, toggle-button, input, select | every next item ships with tests | ✅ |
| Playwright checks in `e2e/visual` (`npm run e2e`): every page light + dark, console errors, layout shift, axe serious / critical; select, code panel, navigation, square buttons, theme toggle | the check we ran by hand is permanent | ✅ |
| CI (`.github/workflows/ci.yml`): test → package build → e2e, report on failure | | ✅ |
| ESLint (`npm run lint`): angular-eslint (OnPush, signals readonly, control flow, template a11y), typescript-eslint, Nx module boundaries by package tags; first step in CI | keeps the conventions and the package graph honest | ✅ |
| Release flow: `nx release` (one version for all packages, changelog from conventional commits), `tools/release.mjs` (version → build → publish → tag), `release` workflow with npm trusted publishing; `tectra-ng` installs everything | needed before apps can install from npm | ✅ 0.1.0 on npm |

Found and fixed while setting it up: a disabled `a[txButton]` still let the parent `(click)` run; `tx-select` had no accessible name (`ariaLabel`, `ariaLabelledBy`, falls back to the placeholder); light muted text and the white-on-green success colour were below WCAG AA (muted → surface 600, success → green 700); toggle-button text contrast.

## Stage 2 — overlay core ✅

| Item | Package | Notes | Status |
|---|---|---|---|
| Overlay: `TxOverlay.open(template \| component, options)` → `TxOverlayRef` (`placement`, `closed`, `close`, `updatePosition`); 12 placements with flip (`txPositions`), enter / leave motion from the origin side (`txAnimateEnter`, `txAnimateLeave`, off with reduced motion), viewport margin, scroll strategies, `matchWidth`, Escape / outside click, focus back to the origin; z-index layers (`--tx-layer-dropdown … toast`); sticky chrome insets (`txOverlayInset`, measured while pinned, or `provideTectra({ overlay: { viewportInsets } })`) — panels fit around a sticky header / bar and close once the origin scrolls under it, also in `tx-select`; CDK loads its structural CSS itself — no `overlay-prebuilt.css` needed | `@tectra-ng/core/overlay` | docs page Core → Overlay | ✅ |
| `txFocusTrap` (auto focus, restore focus), `nextListIndex` (arrows, Home / End, Page, disabled, loop), `TxTypeahead`, `TxAnnouncer` | `@tectra-ng/core/a11y` | | ✅ |
| Locale: `us` / `ua` definitions, `provideTectra({ locale })`, `TxLocaleService` (runtime `setLocale`, `translate` with params, Intl numbers / dates, month and weekday names from the first day of week), `injectTranslations()` is a signal | `@tectra-ng/core/i18n` | docs page Core → Locale | ✅ |
| Select on the new core: placements with flip, reposition on scroll, Home / End / Page keys, type-to-find, translated texts | `@tectra-ng/ui/select` | | ✅ |

## Stage 3 — form primitives (high usage, low complexity) ✅

Detailed checklist per component: [roadmap/stage-3-forms.md](roadmap/stage-3-forms.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| form-field foundation — shared tokens, `filled` variant, focus / invalid / readonly states, invalid from the form control | BaseInput | — | ✅ |
| `ui/input` + `ui/icon-field` + `ui/input-group` + `ui/key-filter` — icons, addons, prefix / suffix, clear, copy, key filter (PrimeNG presets + `positive`, `nospace`, `latin`), sizes, `fluid`, `dt` / `pt` / `unstyled` | InputText, IconField, InputIcon, InputGroup, KeyFilter | 239 | ✅ |
| `ui/label` — label (required, colon, help, subtle), float label (over / in / on), ifta label | FloatLabel / IftaLabel | 353 | ✅ |
| `ui/message` (field part) — hint, error from the control, success | Message | 18 | ✅ |
| `ui/field` — label + control + hint + error, ids and aria wired | — | every form | ✅ |
| `ui/textarea` — auto resize | Textarea | 68 | ✅ |
| `ui/checkbox` — binary, group, indeterminate | Checkbox | 73 | ✅ |
| `ui/radio-button` | RadioButton | — (parity) | ✅ |
| `ui/toggle-switch` | ToggleSwitch | 33 | ✅ |
| `ui/password` — strength meter, toggle mask | Password | 20 | ✅ |
| `ui/input-otp` | InputOtp | 5 | ✅ |
| `ui/input-mask` | InputMask | 2 | ✅ |
| `ui/input-number` | InputNumber | — (parity) | ✅ |
| `ui/rating` | Rating | 7 | ✅ |
| `ui/knob` | Knob | 1 | ✅ |
| `ui/slider` | Slider | — (parity) | ✅ |
| `ui/password-generator` (button + generator service) | — | 2 | ✅ |

## Stage 4 — feedback & display primitives

Detailed checklist per component: [roadmap/stage-4-display.md](roadmap/stage-4-display.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/badge` | Badge | — | ✅ |
| `ui/overlay-badge` | OverlayBadge | 0 | ✅ |
| `ui/pill` — tone, icon, size | Tag (rounded) | **852** | ✅ |
| `ui/tag` + `ui/chip` | Tag, Chip | 43, 0 | ✅ |
| `ui/message` (alert) — built in 3.3 (`tx-message`) | Message | **370** | ✅ |
| `ui/progress-bar` | ProgressBar | 30 | ✅ |
| `ui/progress-spinner` (loader) | ProgressSpinner | 25 | ✅ |
| `ui/skeleton` | Skeleton | 0 | ✅ |
| `ui/avatar` (+ group, initials fallback, photo) | Avatar, AvatarGroup | 174, 9, 6 | ✅ |
| `ui/divider` | Divider | — (parity) | ✅ |
| `ui/card` / `ui/panel` | Card, Panel | 115 | ✅ |
| `ui/fieldset` | Fieldset | — (parity) | ✅ |
| `ui/highlight-text` | — | 43 | ✅ |
| `ui/amount` (money / number formatting) | — | 40 | ✅ |
| `ui/status-icon` | — | 6 | ✅ |
| `ui/link` (link-view, icon-link) | — | 202, 4 | ✅ |

## Stage 5 — overlays (after stage 2) ✅

Detailed checklist per component: [roadmap/stage-5-overlays.md](roadmap/stage-5-overlays.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/tooltip` directive | Tooltip | used by 20+ kit libs, `[toolTip]` on 751 buttons; 4 | ✅ |
| `ui/popover` | Popover | 16 | ✅ |
| `ui/toast` + toast service | Toast + MessageService | 4, core-utils `custom-toastr` | ✅ |
| `ui/dialog` + dialog service (`open(component, { data })`, `DialogRef`, close result) | Dialog, DynamicDialog | core-utils `modal` (`ModalService`, all modals), 2 | ✅ |
| `ui/drawer` | Drawer | 13 | ✅ |
| `ui/confirm` (dialog + popup) + confirm service | ConfirmPopup, ConfirmDialog | 1 | ✅ |
| `ui/menu` — menu, tiered menu, context menu | Menu, TieredMenu, ContextMenu | table row menu, 6 | ✅ |
| `ui/split-button` | SplitButton | — (parity, needs menu) | ✅ |
| `ui/speed-dial` | SpeedDial | — (parity, needs menu) | ✅ |

## Stage 6 — selection ✅

Detailed checklist per component: [roadmap/stage-6-selection.md](roadmap/stage-6-selection.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/select` — parity: clear, groups, disabled options, `dataKey`, filter fields / match modes / delay, virtual scroll, lazy, editable, loading, checkmark, all templates, `dt` / `pt` / `unstyled` | Select | **406** | ✅ |
| `ui/multiselect` — chips display, select all, filter, max selected, selection limit | MultiSelect | 129 + 8 (multiselect mode of the select wrapper) | ✅ |
| `ui/autocomplete` — single / multiple, dropdown, force selection, local or server search, groups | AutoComplete | 1, 2 | ✅ |
| `ui/listbox` — single / multiple, checkbox, meta key selection, filter, groups, virtual scroll | Listbox | — (parity) | ✅ |
| `ui/chips-input` (keywords, pasted lists, pattern, limits) | AutoComplete multiple / InputChips | 3, 5 | ✅ |
| `ui/color-picker` — popover or inline, area + hue + hex, presets, hex / rgb / hsb | ColorPicker | 3 | ✅ |
| `ui/country` + `ui/country-select` (flags, `Intl.DisplayNames`, counts, hints, "+N") + `@tectra-ng/flags` | — | 91 | ✅ |
| `ui/mention-textarea` — suggestions at the caret, mentions output | — | 2 | ✅ |
| `ui/email-suggestion` — own domain completion, typo fixes | — | 4 | ✅ |
| `ui/tree-select`, `ui/cascade-select` | TreeSelect, CascadeSelect | — (parity) | ✅ |

## Stage 7 — data ✅

Detailed checklist per component: [roadmap/stage-7-data.md](roadmap/stage-7-data.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/paginator` — compact mode below 40rem, page size options, `PaginationInterface` | Paginator | 170 | ✅ |
| `ui/table` — sort, selection, resize, reorder, sticky columns, row actions, context menu, settings (visible / order / width persistence), cards below 1024px, loading overlay, virtual scroll, row expansion | Table | **356** | ✅ |
| `ui/tree`, `ui/tree-table` | Tree, TreeTable | — (parity) | ✅ |
| `ui/data-view`, `ui/virtual-scroller` | DataView, VirtualScroller | — (parity) | ✅ |
| `ui/timeline` | Timeline | — (parity) | ✅ |
| `ui/stat-tiles` | — | 48 | ✅ |
| `ui/sparkline` | — | 4 | ✅ |
| `ui/export` — CSV, Excel, Word, PDF, JSON, HTML, Markdown, copy, print, no third-party libraries (`ui/export-font` for PDF) | — | 0, 2 | ✅ |

## Stage 8 — date & time ✅

Detailed checklist per component: [roadmap/stage-8-date.md](roadmap/stage-8-date.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/datepicker` — single / range / multiple, time, month / year views, inline, touch, min / max, locale | DatePicker | 58 | ✅ |
| `ui/month-calendar` (events grid) | — | 23 | ✅ |
| `ui/countdown` (value / unit or target date, remaining-time pipe) | — | 1 | ✅ |
| `ui/analog-clock` | — | 1 | ✅ |

## Stage 9 — navigation & structure

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/tabs` — scrollable, icons, counters, lazy panels | Tabs | 182 | ⬜ |
| `ui/accordion` | Accordion | 8 | ⬜ |
| `ui/stepper` | Stepper / Steps | 12 | ⬜ |
| `ui/breadcrumb` | Breadcrumb | console crumbs | ⬜ |
| `ui/menubar`, `ui/panel-menu` | Menubar, PanelMenu | sidebar menu | ⬜ |
| `ui/splitter`, `ui/scroll-panel`, `ui/toolbar` | Splitter, ScrollPanel, Toolbar | — (parity) | ⬜ |
| `ui/file-upload` | FileUpload | 8 | ⬜ |
| `ui/editor` (rich text, Tiptap / ProseMirror instead of Quill) — own package `@tectra-ng/editor` | Editor | 6, 16 | ⬜ |
| `ui/image` (preview, zoom), `ui/galleria`, `ui/carousel` | Image, Galleria, Carousel | 2 | ⬜ |

## Stage 10 — blocks (`@tectra-ng/blocks`, what PrimeNG does not have)

| Block | Usage | Status |
|---|---|---|
| `filters-panel` (card above a table, popover below 1024px, reset, field state) | 81 | ⬜ |
| `page-header` | 186 | ⬜ |
| `empty-state` | **193** | ⬜ |
| `console-layout` (header + crumbs, icon rail, footer, panel) | 10 | ⬜ |
| `app-layout` (sidebar + topbar + menu, responsive) | 22 | ⬜ |
| `wizard` (stages, step head, progress, footer) | 53 | ⬜ |
| `pinned-tabs` | 1 | ⬜ |
| `command-palette` | 13 | ⬜ |
| `kanban` | 6 | ⬜ |
| `actions-menu` | 6 | ⬜ |
| `action-tile` | 1 | ⬜ |
| `topbar-preferences`, `switch-theme` (circle reveal), `switch-language` | 12, 1, 2 | ⬜ |
| `public-header`, `app-footer`, `cookie-notice` | 5, 7, 4 | ⬜ |
| `network-status` | 4 | ⬜ |
| `qr-code` | 1 | ⬜ |
| `confetti`, `hover-effect` | 7, 0 | ⬜ |

## Stage 11 — charts (`@tectra-ng/charts`, own package because of the chart engine)

Decide first: keep ApexCharts as a peer dependency or draw own SVG charts.

| Chart | Usage | Status |
|---|---|---|
| core (locale, no-data, theme from tokens) | 46 | ⬜ |
| column, spline, pie | 18, 18, 9 | ⬜ |
| bar-list, segmented-bar | 17, 11 | ⬜ |
| heatmap, treemap, org-chart | 10, 2, 3 | ⬜ |

## Stage 12 — utils (`@tectra-ng/utils`)

| Group | Items | Status |
|---|---|---|
| Directives | `copy-to-clipboard`, `debounce-input`, `drag-scroll`, `in-view`, `visible-on-scroll`, `scroll-to-bottom`, `stop-propagation` | ⬜ |
| Pipes | `file-size`, `truncate`, `capitalize`, `highlight`, `plural-form`, `relative-time`, `date-range`, `http-status`, `currency-symbol`, `add-http-prefix` | ⬜ |
| Services | `clock` (+ `remainingTime`), `polling` (`Poller`, `poll`, `refreshEvery`), `selection`, `track-breakpoint`, `form-change-tracker`, `form-validation` | ⬜ |
| Functions | `validators`, `http-params`, `date`, `file`, `string`, `memory-storage` | ⬜ |

