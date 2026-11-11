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
| Theme picker: 17 primaries (`noir` follows the surface), 13 surfaces, 4 themes (`tectra` default, `soft`, `edge`, `paper`) via `createTectraPreset({ style, primary, surface })`, runtime ripple switch; docs header picker; e2e of every style in light and dark (`themes.spec.ts`) | `@tectra-ng/tokens`, `@tectra-ng/themes`, `@tectra-ng/core/config` | ✅ |
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

## Stage 9 — navigation & structure ✅

Detailed checklist per component: [roadmap/stage-9-navigation.md](roadmap/stage-9-navigation.md).

| tectra | PrimeNG equivalent | Usage | Status |
|---|---|---|---|
| `ui/tabs` — segmented / pills / line, scrollable, icons, counters, descriptions, lazy panels, router links (also the docs page tabs) | Tabs | 182 | ✅ |
| `ui/accordion` — panels or items, tones, lazy content | Accordion | 8 | ✅ |
| `ui/stepper` — stepper (linear, vertical) + steps (default / track) | Stepper / Steps | 12 | ✅ |
| `ui/breadcrumb` — chevron / slash, router links, commands | Breadcrumb | console crumbs | ✅ |
| `ui/menubar` (submenus on the kit menu, mobile menu), `ui/panel-menu` (`panel` and the app `sidebar` look, current route) | Menubar, PanelMenu | sidebar menu | ✅ |
| `ui/splitter` (sizes, collapsible, nested, stored state), `ui/scroll-panel`, `ui/toolbar` | Splitter, ScrollPanel, Toolbar | — (parity) | ✅ |
| `ui/file-upload` — drop zone or button, previews, validation, upload with progress, form control (own design) | FileUpload | 8 | ✅ |
| `@tectra-ng/editor` — own package on the ProseMirror core: toolbar presets, selection menu, links, colours, lists, checklists, images (resize, drag), video, mentions, Markdown shortcuts, Quill HTML in and out, full view, AI; `@tectra-ng/editor/content` renderer | Editor | 6, 16 | ✅ |
| `ui/image` (preview with rotate, zoom and pan), `ui/galleria` (thumbnails on any side, indicators, slideshow, full screen), `ui/carousel` (responsive, vertical, autoplay, swipe) | Image, Galleria, Carousel | 2 | ✅ |

## Stage 10 — blocks (`@tectra-ng/blocks`, what PrimeNG does not have)

Detailed checklist per block: [roadmap/stage-10-blocks.md](roadmap/stage-10-blocks.md). `@tectra-ng/blocks` is a published package and part of `tectra-ng`.

| Block | Usage | Status |
|---|---|---|
| `filters-panel` (card above a table, popover below 1024px, reset, field state) | 81 | ✅ |
| `page-header` | 186 | ✅ |
| `empty-state` | **193** | ✅ |
| `console-layout` (header + crumbs, icon rail, footer, panel) | 10 | ✅ |
| `app-layout` (sidebar + topbar + menu, responsive) | 22 | ✅ |
| `wizard` (stages, step head, progress, footer) | 53 | ✅ |
| `pinned-tabs` | 1 | ✅ |
| `command-palette` | 13 | ✅ |
| `kanban` | 6 | ✅ |
| `actions-menu` | 6 | ✅ |
| `action-tile` | 1 | ✅ |
| `topbar-preferences`, `switch-theme` (circle reveal), `switch-language` | 12, 1, 2 | ✅ |
| `public-header`, `app-footer`, `cookie-notice` | 5, 7, 4 | ✅ |
| `network-status` | 4 | ✅ |
| `qr-code` | 1 | ✅ |
| `confetti`, `hover-effect` | 7, 0 | ✅ |

## Catch-up — added in the first consumer app after its stage

Parts the first app gained after their stage here was planned (usage counted 2026-11-09). Small items; do them before stage 11. Everything else it added is covered under another name: `ring-slider` = `ui/knob` (`arc="ring"`, `txKnobValue`), `keywords-input` = `ui/chips-input`, `link-view` = `ui/link`, `user-avatar` = `ui/avatar`, `confirm-modal` = `ui/confirm`, `upload-file` = `ui/file-upload`, `validation-message` = `tx-field-error`, `editor-preview` = `@tectra-ng/editor/content`, `export-csv` / `export-excel` = `ui/export`.

| Item | Usage | Status |
|---|---|---|
| `ui/avatar` group: `+N` opens a popover that lists the hidden people (avatar + name), a name tooltip on every avatar (`tooltips`, `tooltip` on a single avatar), `morePopover="false"` keeps `+N` a label | 10 | ✅ |
| `ui/list-input` — a textarea for pasting many lines (domains, URLs, emails, ids): live parsing with an own parser / validator, duplicate and invalid counters, "Clean up" (drop invalid and duplicates) and "Clear", the parsed array as the value; plural forms in `@tectra-ng/core/i18n` (`formatMessage`, `{count, plural, …}`) | 6 | ✅ |
| `ui/truncate-text` — one line cut to a character limit with the full value in a tooltip, search highlight, optional link and copy button (long URLs, ids and names in table cells) | 4 | ✅ |
| `blocks/mascot` — a pixel-art SVG mascot in the accent colour with animated states (idle, thinking, happy, sleeping, walking, short tricks) for assistants, empty states and onboarding | 4 | ✅ |
| `ui/color-picker` field mode — a text field with a colour dot at its start: type the hex or open the picker from the dot, both in sync, a hex validator | 1 | ✅ |

## Stage 11 — charts (`@tectra-ng/charts`)

Own SVG charts, no chart library: they render on the server like the rest of the kit, take every colour, font and radius from the tokens (so the themes, dark mode and `dt` work), use the kit's tooltip, legend and empty state, and are reachable from the keyboard. A broad catalogue for any app, not only the first one, built in levels on one core; each level ships on its own. Engine-level maths that is unreasonable to write (a hard layout) may come from a small pure module, decided per item. SVG holds tens of thousands of points with decimation; a canvas renderer can join the same core later. Detailed checklist: [roadmap/stage-11-charts.md](roadmap/stage-11-charts.md). Usage = elements in the first app (2026-11-09).

| Level | Charts and features | Usage | Status |
|---|---|---|---|
| 1. Core | Scales (linear, log, time, band), nice ticks, axes, grid, legend that toggles series, tooltip with a crosshair, responsive size, motion, "No data", numbers and dates in the tectra locale, series palette from tokens, decimation, keyboard and screen reader access | 46 | ✅ |
| 2. Basic | line and area (`spline`), column and bar (grouped, stacked, 100%, horizontal), combo (columns + line, two y axes), pie and donut (centre total, legend beside), scatter and bubble — all done | 18, 18, 9 | ✅ |
| 3. Lists and grids | bar-list, segmented-bar, heatmap (grid with sticky headers, calendar), treemap, rank-line (positions over time, rank 1 on top, gaps) | 11, 6, 4, 1, 1 | ✅ |
| 4. More shapes | radar, radial bar and gauge, funnel, waterfall, bullet | 0 | ✅ |
| 5. Special | candlestick (OHLC), boxplot, range area, timeline and gantt, sankey, sunburst, org-chart (pan / zoom canvas, minimap, search) | 2 (org-chart) | ✅ |
| 6. Interaction | zoom, pan and brush on an axis, annotations (lines, bands, points), export PNG / SVG / CSV, live updates | 0 (zoom is off in the first app) | ✅ |

## Stage 12 — utils (`@tectra-ng/utils`)

Directives, pipes, services and helpers apps use next to the components — the first consumer app's utility library, reviewed: generic parts kept and extended, parts the kit already covers or that are app wiring left out (list in the checklist), PrimeNG utility directives added. Own package above `ui`, one entry point per utility. Detailed checklist: [roadmap/stage-12-utils.md](roadmap/stage-12-utils.md). Usage = files of the first app (2026-11-11).

| Group | Items | Usage | Status |
|---|---|---|---|
| Package | `@tectra-ng/utils`, docs category `Utilities`, README API tables (pipes, functions, methods, options, constants, providers) on the docs API tab | — | ✅ |
| Dates and text | `date` (`txDate`, functions, date range), `plural`, `relative-time`, `currency`, `text`, `file` (file size, download) | 318, 173, 48, 8, 7, 11 | 🟡 date, plural |
| Forms | `debounce-input`, `form-validation`, `validators`, `form-changes`, `auto-focus` | 79, 70, 45, 1, 6 | 🟡 debounce-input |
| Data | `filter-state` (local storage + URL), `http` (params, retry, status), `polling`, `selection`, `filter`, `stream`, `random` | 70, 98, 24, 4, 4, 3, 1 | ⬜ |
| DOM | `clipboard`, `in-view` (+ defer, visible on scroll), `go-back`, `stop-propagation`, `drag-scroll`, `scroll-end`, `style-class` | 38, 8, 9, 4, 2, 0, 0 | ⬜ |
| Services | `clock`, `title`, `breakpoint` | 18, 5, 5 | ⬜ |

## Editor backlog (`@tectra-ng/editor`, between stages)

Ideas for the editor on top of 9.8, no new engine dependencies. Already shipped: slash menu, tables (rows, columns, header row, column resize), callouts, AI actions on a selection, emoji by `:`, typography, link over a selection, drafts.

| Feature | What | Status |
|---|---|---|
| Block handle | ⋮⋮ on hover: drag a paragraph, list or table; menu "Turn into…", "Duplicate", "Delete", "Copy link to block" | ⬜ |
| Code blocks | Own light tokenizer (TS / JS / JSON / HTML / CSS / SQL / bash), language picker, "Copy" button | ⬜ |
| Image menu | Align left / center / right, caption, alt text, open in preview, replace | ⬜ |
| Find and replace | Ctrl/⌘+F inside the editor: highlight matches, next / previous, replace all | ⬜ |
| Dates | "Date" item next to mentions, opens the kit datepicker, inserts a localized date chip | ⬜ |
| Tasks with due dates | Due date and assignee (`@`) on a task item | ⬜ |
| Table of contents | Built from headings, heading anchors | ⬜ |
| Export | PDF / DOCX of the text through `ui/export` | ⬜ |
| Sticky toolbar | Toolbar sticks to the top while a long text scrolls | ⬜ |
| Shortcut sheet | Ctrl/⌘+/ opens all shortcuts and markdown rules | ⬜ |
| Word count | Words and reading time in the footer, word goal | ⬜ |
| Focus mode | Full view: narrow centred column, toolbar hides while typing | ⬜ |
| Table cells | Cell background, merge and split cells | ⬜ |
| Hashtags | `#` suggestions for tags or task links on the suggestion engine | ⬜ |
| Markdown | `format="markdown"`: read and write Markdown, paste Markdown as formatting | ⬜ |
| Templates | Snippets and document templates | ⬜ |
| Comments | Comments on text ranges, review style | ⬜ |
| Version history | Versions with highlighted changes | ⬜ |
| Collaboration | Real-time co-editing (needs a backend, own stage) | ⬜ |

## Stage 13 — own editor engine (`@tectra-ng/editor`, later)

The editor runs on the ProseMirror core (`prosemirror-model`, `-state`, `-view`, `-transform`, ~12 800 lines, MIT); everything above it is already ours. Later the core becomes our own code too: start from a copy of those four packages inside `packages/editor` (keep the MIT notice), then rewrite it piece by piece behind the same `tx-editor` API, so apps do not change.

| Step | What | Status |
|---|---|---|
| Vendor | Copy the four packages into `packages/editor/src/engine/core`, drop the npm dependencies, keep their tests running | ⬜ |
| State | Own state, selection, transactions and plugin system | ⬜ |
| Model | Own schema with content expressions, fragments, resolved positions, DOM parse / serialize | ⬜ |
| Transform | Own steps, position mapping, inversion and the replace fitting algorithm | ⬜ |
| View | Own `contenteditable` bridge: input, IME composition, selection sync, clipboard, drag and drop, browser workarounds (Chrome, Safari, Firefox, Android, iOS) | ⬜ |

## Stage 14 — code editor (`@tectra-ng/code-editor`)

The first app edits HTML, CSS, JavaScript and other source text and shows the changes between two versions (16 uses). Decide the engine first, the same way as the rich text editor: a modular core (CodeMirror 6: state, view, language packs; MIT) with everything above it ours, or a wrapper over a full editor (Monaco: heavy, own look, no server rendering). The core is the default choice.

| Item | Usage | Status |
|---|---|---|
| Editor: `value` / `valueChange`, `language` (HTML, CSS, JavaScript, TypeScript, JSON, Markdown, plain), `height`, `readOnly`, line numbers, syntax colours from tokens (light / dark / styles), search, undo, works with forms | 16 | ⬜ |
| Diff: inline and side by side views of `original` → `value`, scroll to the first change, read-only or editable modified side | — | ⬜ |
| Docs, tests, server rendering (a static highlighted view on the server, the editor after hydration) | — | ⬜ |
