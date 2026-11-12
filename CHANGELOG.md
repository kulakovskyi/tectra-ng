## 0.2.5 (2026-11-12)

### 🩹 Fixes

- ship the LICENSE file in the blocks, brand-icons, code-editor and editor packages; brand-icons is MIT AND CC0-1.0 for the Simple Icons paths ([2daace8](https://github.com/kulakovskyi/tectra-ng/commit/2daace8))

### ❤️ Thank You

- tears @kulakovskyi

## 0.2.4 (2026-11-11)

This was a version bump only, there were no code changes.

## 0.2.3 (2026-11-11)

### 🩹 Fixes

- **ci:** separate the CI concurrency group per event so a stuck run cannot hold main ([17910ff](https://github.com/kulakovskyi/tectra-ng/commit/17910ff))
- **ci:** time out stuck jobs after 15–45 minutes instead of six hours ([f20a7a3](https://github.com/kulakovskyi/tectra-ng/commit/f20a7a3))
- **release:** rebase the release commit on new main commits so the bot never pushes workflow changes ([400af78](https://github.com/kulakovskyi/tectra-ng/commit/400af78))
- **security:** resolve the CodeQL findings in the docs server, registry text, Markdown export, video links and the AI example ([7a84746](https://github.com/kulakovskyi/tectra-ng/commit/7a84746))
- **security:** video links parsed with URL, docs server path check and plain text without tag-stripping regexes ([8d91c96](https://github.com/kulakovskyi/tectra-ng/commit/8d91c96))

### ❤️ Thank You

- tears @kulakovskyi

## 0.2.2 (2026-11-11)

### 🚀 Features

- **code-editor:** code editor, diff and highlighted code on the CodeMirror core; stage 13 done
- **docs:** readme front matter for pages that share one source folder
- **ui:** tx-avatar-editor picks, replaces or removes the photo with type and size checks, drop, loading and a confirm
- **ui:** tx-tag-list shows the first tags and the rest behind +N in a popover
- **ui:** copy buttons turn the copy icon into a check with a short animation

### 🩹 Fixes

- **ci:** build the Nx project graph before lint in the release workflow
- **docs:** code editor form example submits through a form group instead of reloading the page
- **docs:** example anchors link to the current page instead of the home page
- **docs:** API tab shows the selector of the page's own component
- **e2e:** press redo as Shift+KeyZ so Linux sends an uppercase key

### ❤️ Thank You

- tears

## 0.2.1 (2026-11-11)

### 🚀 Features

- **utils:** @tectra-ng/utils package, stage 12 checklist and README API tables on the docs API tab ([f7aac84](https://github.com/kulakovskyi/tectra-ng/commit/f7aac84))
- **utils:** txDate and txDateRange pipes, provideTxDateFormat, calendar functions, date presets and time constants ([30fd598](https://github.com/kulakovskyi/tectra-ng/commit/30fd598))
- **utils:** txPluralForm and txPlural pipes in the tectra locale, plural functions ([c5858ec](https://github.com/kulakovskyi/tectra-ng/commit/c5858ec))
- **utils:** txDebounceInput directive with distinct, minimum length, flush and cancel ([eacfce1](https://github.com/kulakovskyi/tectra-ng/commit/eacfce1))
- **utils:** scroll to and focus the first invalid field, txScrollToInvalid on a form, markAllTouched ([10790d2](https://github.com/kulakovskyi/tectra-ng/commit/10790d2))
- **utils:** txFilterState in local storage and the URL with back and forward, TxUrlFilters and TxSaveFilters base classes, server safe storage ([63b1e8e](https://github.com/kulakovskyi/tectra-ng/commit/63b1e8e))
- **utils:** buildHttpParams, retryHttpReads with back-off and Retry-After, HTTP status tone and translated label pipes ([06c6b8c](https://github.com/kulakovskyi/tectra-ng/commit/06c6b8c))
- **utils:** txRelativeTime pipe in the tectra locale with granularity, largest unit, numeric and style options ([6bae50b](https://github.com/kulakovskyi/tectra-ng/commit/6bae50b))
- **utils:** TxValidators for codes, dates, links, passwords, matching fields, IP, domains, duplicates, JSON and prices, with messages in tx-field-error ([fad741a](https://github.com/kulakovskyi/tectra-ng/commit/fad741a))
- **utils:** txCopy directive and TxClipboard with a translated kit toast, a fallback outside a secure context and keyboard access ([b404041](https://github.com/kulakovskyi/tectra-ng/commit/b404041))
- **utils:** poll until a job is done with back-off and a hidden-tab pause, refreshEvery, TxPoller with signals ([de4d1c4](https://github.com/kulakovskyi/tectra-ng/commit/de4d1c4))
- **utils:** TxClock with a shared now signal, countdowns as signals, no timer on the server ([4995acf](https://github.com/kulakovskyi/tectra-ng/commit/4995acf))
- **utils:** txGoBack goes back in history or to a fallback route when the page was opened directly ([13a8a36](https://github.com/kulakovskyi/tectra-ng/commit/13a8a36))
- **utils:** txCurrencySymbol for any ISO currency in the tectra locale ([c35b692](https://github.com/kulakovskyi/tectra-ng/commit/c35b692))
- **utils:** txInView with enter and leave classes and txVisibleOnScroll for items seen in a scrolling list ([583e727](https://github.com/kulakovskyi/tectra-ng/commit/583e727))
- **utils:** txFileSize in the locale number format, downloadFile and downloadBlob ([90c6d07](https://github.com/kulakovskyi/tectra-ng/commit/90c6d07))
- **utils:** provideTxTitle with Page · App titles, a prefix for counters and translated keys ([27a1f88](https://github.com/kulakovskyi/tectra-ng/commit/27a1f88))
- **utils:** TxBreakpoints with mobile, tablet and any media query as signals ([66edf08](https://github.com/kulakovskyi/tectra-ng/commit/66edf08))
- **utils:** TxSelection with header checkbox state, toggle all and selected items ([43faefd](https://github.com/kulakovskyi/tectra-ng/commit/43faefd))
- **utils:** txStopPropagation for clicks or a list of events, with preventDefault ([cbce550](https://github.com/kulakovskyi/tectra-ng/commit/cbce550))
- **utils:** txSearch and txFilterBy with the table match modes, accent and case insensitive ([b9642ef](https://github.com/kulakovskyi/tectra-ng/commit/b9642ef))
- **utils:** txTruncate at the end or in the middle, txCapitalize, txHttpPrefix, slugify, transliterate and escapeHtml ([575b699](https://github.com/kulakovskyi/tectra-ng/commit/575b699))
- **utils:** readTextStream and textChunks for streamed text answers ([efe4b08](https://github.com/kulakovskyi/tectra-ng/commit/efe4b08))
- **utils:** pickRandom, pickRandomN and shuffle ([7547946](https://github.com/kulakovskyi/tectra-ng/commit/7547946))
- **utils:** txDragScroll to scroll a box by dragging or pan a canvas ([2691d80](https://github.com/kulakovskyi/tectra-ng/commit/2691d80))
- **utils:** trackFormChanges with a changed signal, commit and revert, and TxFormChangeTracker ([324d36a](https://github.com/kulakovskyi/tectra-ng/commit/324d36a))
- **utils:** txScrollEnd for infinite scrolling, once per page and up to a limit ([9161962](https://github.com/kulakovskyi/tectra-ng/commit/9161962))
- **utils:** txAutoFocus on a field or the first field inside, with select ([22e1ff6](https://github.com/kulakovskyi/tectra-ng/commit/22e1ff6))
- **utils:** txStyleClass shows, hides or toggles an element by classes with enter and leave animations; stage 12 done ([a38c2a3](https://github.com/kulakovskyi/tectra-ng/commit/a38c2a3))

### 🩹 Fixes

- **docs:** filter toolbar in one row, buttons keep their width in the utility examples ([f1c1b48](https://github.com/kulakovskyi/tectra-ng/commit/f1c1b48))
- **ui:** tx-field keeps its label and control at the top when a grid row stretches it; tidy the validators list example ([88f01dc](https://github.com/kulakovskyi/tectra-ng/commit/88f01dc))

### ❤️ Thank You

- tears @kulakovskyi

## 0.2.0 (2026-11-11)

### 🚀 Features

- **charts:** bar list — top-N ranking with share bars, percent of the total and router links ([243aea0](https://github.com/kulakovskyi/tectra-ng/commit/243aea0))
- **charts:** segmented bar — parts of a whole in one bar with tones, small and large sizes, legend ([28ef521](https://github.com/kulakovskyi/tectra-ng/commit/28ef521))
- **charts:** heatmap — tone and value-scale cells, sticky headers, row templates, calendar layout; the page scrolls past the grid ([d546819](https://github.com/kulakovskyi/tectra-ng/commit/d546819))
- **charts:** treemap — squarified tiles, labels that fit, nested groups, tooltip and keyboard ([9cc4e2c](https://github.com/kulakovskyi/tectra-ng/commit/9cc4e2c))
- **charts:** rank chart — positions over time with rank 1 on top, gaps, notes, legend and keyboard ([79be796](https://github.com/kulakovskyi/tectra-ng/commit/79be796))
- **charts:** org chart — tree of cards on a pan / zoom canvas with search, minimap, full screen and hotkeys ([2b56857](https://github.com/kulakovskyi/tectra-ng/commit/2b56857))
- **charts:** chart menu downloads SVG, PNG and CSV on line, column and pie charts ([21b12bb](https://github.com/kulakovskyi/tectra-ng/commit/21b12bb))
- **charts:** combo chart with columns, lines and areas on a second value axis aligned to the grid ([6db389d](https://github.com/kulakovskyi/tectra-ng/commit/6db389d))
- **charts:** scatter and bubble chart with trend lines, per point colours and labels, a time x axis ([216ddd3](https://github.com/kulakovskyi/tectra-ng/commit/216ddd3))
- **charts:** radar chart, radial bar and gauge on shared arc helpers in the chart core ([f4e05ee](https://github.com/kulakovskyi/tectra-ng/commit/f4e05ee))
- **charts:** funnel, waterfall and bullet charts ([e308f64](https://github.com/kulakovskyi/tectra-ng/commit/e308f64))
- **charts:** candlestick, box plot and range area charts ([c4df9aa](https://github.com/kulakovskyi/tectra-ng/commit/c4df9aa))
- **charts:** the tooltip follows the mouse with its arrow at the cursor, bar-like charts lay a hover band under the whole category ([f4b4c94](https://github.com/kulakovskyi/tectra-ng/commit/f4b4c94))
- **charts:** gantt chart with groups, progress, milestones, a today line, zoom from days to quarters and a timeline layout ([96ad1bc](https://github.com/kulakovskyi/tectra-ng/commit/96ad1bc))
- **charts:** sankey diagram and sunburst chart with drill down ([95dca46](https://github.com/kulakovskyi/tectra-ng/commit/95dca46))
- **charts:** annotations on cartesian charts, zoom, pan and brush on the line chart, live updates with a sliding window ([5cc6824](https://github.com/kulakovskyi/tectra-ng/commit/5cc6824))

### 🩹 Fixes

- **blocks:** app layout rail menu icons stand on the logo axis and stay put while the rail opens and folds ([76ccea2](https://github.com/kulakovskyi/tectra-ng/commit/76ccea2))
- **charts:** treemap labels stay inside their tile with an ellipsis; txTreemapTile template for own tile content ([5892e3f](https://github.com/kulakovskyi/tectra-ng/commit/5892e3f))
- **charts:** org chart keeps the tree in view while panning, hides an off-map minimap frame, outlines the path in the path colour ([9bbbeed](https://github.com/kulakovskyi/tectra-ng/commit/9bbbeed))
- **charts:** tooltip arrow points at the value near the screen edge; org chart toolbar and minimap fit narrow screens, full screen covers the page in every browser ([090ca94](https://github.com/kulakovskyi/tectra-ng/commit/090ca94))
- **charts:** chart and org chart menus open as popovers with an arrow, in the kit's action menu look ([6ba0ee7](https://github.com/kulakovskyi/tectra-ng/commit/6ba0ee7))
- **charts:** native org chart full screen drops the page scrollbar gutter so it covers the whole screen ([1e977c9](https://github.com/kulakovskyi/tectra-ng/commit/1e977c9))
- **charts:** gantt rows tint the name column on hover and groups fold smoothly like an accordion ([65f9f0f](https://github.com/kulakovskyi/tectra-ng/commit/65f9f0f))
- **docs:** box plot examples use realistic sample data with a few outliers ([9f654a9](https://github.com/kulakovskyi/tectra-ng/commit/9f654a9))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.9 (2026-11-10)

### 🚀 Features

- **charts:** @tectra-ng/charts — core, line, column and pie charts ([a40fc7d](https://github.com/kulakovskyi/tectra-ng/commit/a40fc7d))
- **ui:** catch-up items — avatar group list, list input, truncate text, mascot, color field ([5107a7e](https://github.com/kulakovskyi/tectra-ng/commit/5107a7e))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.8 (2026-11-09)

### 🚀 Features

- **blocks:** add the confetti and the hover effect ([d429e18](https://github.com/kulakovskyi/tectra-ng/commit/d429e18))
- **blocks:** brand slot and link hover background in the public header ([e05e310](https://github.com/kulakovskyi/tectra-ng/commit/e05e310))
- **docs:** add the landing page ([b99e2b1](https://github.com/kulakovskyi/tectra-ng/commit/b99e2b1))
- **docs:** rebuild the introduction page ([bd04645](https://github.com/kulakovskyi/tectra-ng/commit/bd04645))
- **docs:** rebuild the installation page and animate copy buttons ([fcad428](https://github.com/kulakovskyi/tectra-ng/commit/fcad428))
- **docs:** rebuild the theming page and calm card hovers ([0f56147](https://github.com/kulakovskyi/tectra-ng/commit/0f56147))
- **docs:** rebuild the icons page ([18bddb3](https://github.com/kulakovskyi/tectra-ng/commit/18bddb3))
- **docs:** add the site footer to the docs ([7c4bdc5](https://github.com/kulakovskyi/tectra-ng/commit/7c4bdc5))

### 🩹 Fixes

- **themes:** contrast of the soft, edge and paper styles, checked by e2e ([0532f11](https://github.com/kulakovskyi/tectra-ng/commit/0532f11))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.7 (2026-11-09)

### 🚀 Features

- **blocks:** publish @tectra-ng/blocks and add the filters panel ([d2d6ec0](https://github.com/kulakovskyi/tectra-ng/commit/d2d6ec0))
- **blocks:** add the page header ([60ff3f5](https://github.com/kulakovskyi/tectra-ng/commit/60ff3f5))
- **blocks:** add the empty state ([2d61b7e](https://github.com/kulakovskyi/tectra-ng/commit/2d61b7e))
- **blocks:** add the console layout and the app footer ([b6ae4b0](https://github.com/kulakovskyi/tectra-ng/commit/b6ae4b0))
- **blocks:** add the app layout ([8b35545](https://github.com/kulakovskyi/tectra-ng/commit/8b35545))
- **blocks:** add the wizard ([0784c74](https://github.com/kulakovskyi/tectra-ng/commit/0784c74))
- **blocks:** add the pinned tabs ([7fcde42](https://github.com/kulakovskyi/tectra-ng/commit/7fcde42))
- **blocks:** add the command palette ([29a47c2](https://github.com/kulakovskyi/tectra-ng/commit/29a47c2))
- **blocks:** add the kanban ([206f8c0](https://github.com/kulakovskyi/tectra-ng/commit/206f8c0))
- **blocks:** add the actions menu and the action tile ([5666b4c](https://github.com/kulakovskyi/tectra-ng/commit/5666b4c))
- **blocks:** add the theme and language switches and the preferences capsule ([d5ac601](https://github.com/kulakovskyi/tectra-ng/commit/d5ac601))
- **blocks:** add the public header and the cookie notice ([09ad631](https://github.com/kulakovskyi/tectra-ng/commit/09ad631))
- **blocks:** add the network status ([52ac168](https://github.com/kulakovskyi/tectra-ng/commit/52ac168))
- **qr:** add the QR code package and block ([0a5af25](https://github.com/kulakovskyi/tectra-ng/commit/0a5af25))
- **ui:** mark the current panel menu item with active ([6e00029](https://github.com/kulakovskyi/tectra-ng/commit/6e00029))
- **ui:** collapsed rail look for the sidebar panel menu ([a8b551d](https://github.com/kulakovskyi/tectra-ng/commit/a8b551d))

### 🩹 Fixes

- **docs:** keep the scroll position when only the query changes ([c689dc1](https://github.com/kulakovskyi/tectra-ng/commit/c689dc1))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.6 (2026-11-08)

### 🚀 Features

- **docs:** prerender every page for search engines and AI assistants ([1c655b7](https://github.com/kulakovskyi/tectra-ng/commit/1c655b7))

### 🩹 Fixes

- **core:** overlay positioning on phones and in Safari ([8ef7b1c](https://github.com/kulakovskyi/tectra-ng/commit/8ef7b1c))
- **docs:** phone layout ([aefae0c](https://github.com/kulakovskyi/tectra-ng/commit/aefae0c))
- **editor:** render content on the server ([9ad6984](https://github.com/kulakovskyi/tectra-ng/commit/9ad6984))
- **editor:** convert Quill markup with the server DOM ([e4fcc95](https://github.com/kulakovskyi/tectra-ng/commit/e4fcc95))
- **themes:** menu max height follows the dynamic viewport ([ee3d155](https://github.com/kulakovskyi/tectra-ng/commit/ee3d155))
- **ui:** button sees its projected label on the server ([6ab7962](https://github.com/kulakovskyi/tectra-ng/commit/6ab7962))
- **ui:** icon field leaves room for its icons before it is measured ([394d635](https://github.com/kulakovskyi/tectra-ng/commit/394d635))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.5 (2026-11-07)

### 🚀 Features

- **ui:** image, galleria and carousel ([2aeec02](https://github.com/kulakovskyi/tectra-ng/commit/2aeec02))

### 🩹 Fixes

- **docs:** layout on phones and tablets ([04758ed](https://github.com/kulakovskyi/tectra-ng/commit/04758ed))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.4 (2026-11-07)

### 🚀 Features

- **editor:** rich text editor package ([9977370](https://github.com/kulakovskyi/tectra-ng/commit/9977370))
- **editor:** slash menu, tables, callouts and AI actions ([7121cd9](https://github.com/kulakovskyi/tectra-ng/commit/7121cd9))
- **ui:** table date filter and date editor use the date picker ([4bd1920](https://github.com/kulakovskyi/tectra-ng/commit/4bd1920))
- **ui:** tabs, accordion, stepper and breadcrumb ([ca3e12d](https://github.com/kulakovskyi/tectra-ng/commit/ca3e12d))
- **ui:** menubar and panel menu ([efa3900](https://github.com/kulakovskyi/tectra-ng/commit/efa3900))
- **ui:** splitter, scroll panel and toolbar ([05ffe8d](https://github.com/kulakovskyi/tectra-ng/commit/05ffe8d))
- **ui:** file upload ([10e918a](https://github.com/kulakovskyi/tectra-ng/commit/10e918a))

### 🩹 Fixes

- **ui:** input group squares the joined corners of every field ([7acf493](https://github.com/kulakovskyi/tectra-ng/commit/7acf493))
- **ui:** textarea keeps the height dragged with the resize handle ([a90c01d](https://github.com/kulakovskyi/tectra-ng/commit/a90c01d))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.3 (2026-11-06)

### 🚀 Features

- **ui:** stage 7.5 — timeline ([c4cdfdd](https://github.com/kulakovskyi/tectra-ng/commit/c4cdfdd))
- **ui:** stage 7.6 — stat tiles ([fea9b0a](https://github.com/kulakovskyi/tectra-ng/commit/fea9b0a))
- **ui:** stage 7.7 — sparkline ([2d95b55](https://github.com/kulakovskyi/tectra-ng/commit/2d95b55))
- **ui:** stage 7.8 — export without third-party libraries ([6af37a1](https://github.com/kulakovskyi/tectra-ng/commit/6af37a1))
- **ui:** stage 8.1 — date picker ([93c9f25](https://github.com/kulakovskyi/tectra-ng/commit/93c9f25))
- **ui:** stage 8.2 — month calendar ([152fdd7](https://github.com/kulakovskyi/tectra-ng/commit/152fdd7))
- **ui:** date picker range preview and pickable days of other months ([f86aa19](https://github.com/kulakovskyi/tectra-ng/commit/f86aa19))
- **ui:** stage 8.3 — countdown ([58876d5](https://github.com/kulakovskyi/tectra-ng/commit/58876d5))
- **ui:** stage 8.4 — analog clock ([3f3a4a6](https://github.com/kulakovskyi/tectra-ng/commit/3f3a4a6))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.2 (2026-11-06)

### 🚀 Features

- **docs:** blocks logo that waves, wordmark and favicon ([db8c849](https://github.com/kulakovskyi/tectra-ng/commit/db8c849))
- **flags:** @tectra-ng/flags — country flags as lazy SVG chunks ([8bb0f09](https://github.com/kulakovskyi/tectra-ng/commit/8bb0f09))
- **themes:** theme picker with primaries, surfaces and four themes ([8fd6066](https://github.com/kulakovskyi/tectra-ng/commit/8fd6066))
- **ui:** stage 7.3 — tree and tree table ([d618122](https://github.com/kulakovskyi/tectra-ng/commit/d618122))
- **ui:** stage 7.4 — data view and virtual scroller ([8aa6549](https://github.com/kulakovskyi/tectra-ng/commit/8aa6549))

### 🩹 Fixes

- **docs:** smooth dark mode reveal, remembered mode, real version badge ([d4b612c](https://github.com/kulakovskyi/tectra-ng/commit/d4b612c))

### ❤️ Thank You

- tears @kulakovskyi

## 0.1.1 (2026-11-06)

### 🩹 Fixes

- **release:** the changelog step reads its git options from release.changelog.git

### ❤️ Thank You

- tears

## 0.1.0 (2026-11-06)

First public release.

### Packages

- `tectra-ng` — everything below at one version
- `@tectra-ng/ui` — components, one entry point per component
- `@tectra-ng/core` — `provideTectra`, overlay, accessibility helpers, forms, locale, ripple, styles
- `@tectra-ng/themes` — light and dark themes, `createInkPreset`, `definePreset`, component tokens
- `@tectra-ng/tokens` — palettes, radius, typography, shadows, spacing, motion
- `@tectra-ng/icons` — 334 icons and `TxIcon`
- `@tectra-ng/brand-icons` — brand logos for `TxIcon`

### Components

- **Forms:** input, icon field, input group, key filter, label (float / ifta), field, message, textarea, checkbox, radio button, toggle switch, password, password generator, input OTP, input mask, input number, rating, knob, slider
- **Display:** badge, overlay badge, pill, tag, chip, progress bar, progress spinner, skeleton, avatar, divider, card, panel, fieldset, highlight text, amount, status icon, link
- **Actions:** button, button group, toggle button, split button, speed dial
- **Overlays:** tooltip, popover, toast, dialog, drawer, confirm, menu (menu, tiered menu, context menu)
- **Selection:** select, multiselect, autocomplete, listbox, chips input, color picker, country and country select, mention textarea, email suggestion, tree select, cascade select
- **Data:** paginator, table

Every component is standalone, OnPush and signal-based, themable through `dt`, `pt` and `unstyled`, keyboard accessible and checked with axe in light and dark.
