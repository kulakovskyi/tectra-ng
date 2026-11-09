# Stage 10 — blocks, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Blocks live in `@tectra-ng/blocks/<name>` (one entry point per block, same folder shape as a `ui` component) and are built from the kit components. Sources: the first consumer app's own blocks (usage = files that use them, 2026-11-05) — their API, behaviour and look are the reference. Its root font size is 14px, so its `1rem` (and every Tailwind step) is 14px: `p-5` = `17.5px`, `gap-3` = `10.5px`, `h-10` = `35px`, `text-sm` = `12.25px`. Its semantic values: card radius `10px`, control radius `7px`, overlay radius `14px`, focus ring `0 0 0 2px` card + `0 0 0 4px` primary.

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page (category `Blocks`, `source:` / `package:` front matter) with an example per feature, unit tests, e2e check of what the block does, lint clean, renders on the server like in the browser.

---

## 10.0 Package ✅

- [x] `@tectra-ng/blocks` is a published package: `package.json` (peers on `@tectra-ng/*`, `publishConfig`), `test` target, `npm run test`, `release.projects`, part of `tectra-ng`, install docs, docs category `Blocks`

## 10.1 Filters panel — `blocks/filters-panel` ✅

First app (81): a card that holds the filter fields above a table or a list. Each field wrapper carries a field directive (`key`, `filterLabel`, `filterActive`); fields may sit at any depth. `variant` `card` / `plain` (no frame, inside another card or a dialog), `busy` (dimmed, no pointer events), a storage key turns on the "Show filters" menu: a check per field, drag to reorder, "N of M" counter, "Reset to default"; a field with a value is always shown and cannot be hidden (dot + hint); `defaultVisible` (3) fields are shown until the user chooses; the layout `{ order, visible }` is saved in `localStorage` (an old array value is read as `visible`). Actions slot on the right (reset, create …). Below 64rem (1024px) a panel with two or more fields collapses into a "Filters" button with the number of active fields; it opens a panel with all fields (hidden ones too, so no menu button there), the fields scroll inside it, it closes on an outside click (not in an overlay of a field) or Escape; the reset action leaves the bar and a full-width outlined warn "Clear filters" button at the bottom of the panel clicks it. A `hasFilterValue` pipe: non-blank string, non-empty array, anything but `null` / `undefined`, any of several values.

The look (rem × 14px). Panel: wrap, items at the end, `10.5px` gap, `17.5px` padding, `10px` radius, card background, `1px` content-border ring, opacity `200ms`; busy `0.6`. Fields: a grid `repeat(auto-fill, minmax(168px, 1fr))`, `10.5px` × `14px` gaps, at least `min(100%, 196px)` wide. Actions: `7px` gap, at the end. Menu button: `35px` square, `7px` radius, ground background, muted icon, inset content-border ring, hover background and text colour (also while open), hidden-count badge `18px` primary pill `9.625px` weight 600 at `-5.25px` with a `2px` card ring. Menu: popover at the end of the button, `14px` radius, `0 16px 40px -12px rgb(0 0 0 / 0.22), 0 4px 12px -4px rgb(0 0 0 / 0.1)` shadow, no padding; inside `224px` wide, max `min(70vh, 392px)`, `7px` padding; head `5.25px 8.75px 7px`, title `9.625px` weight 600 upper case `0.05em` muted, counter `9.625px` tabular muted; rows `1px` apart, `7px` radius, hover 9% primary; row button `28px`, `7px` / `3.5px` padding, `7px` gap, `11.375px`; check `14px` primary, scales `0.5` → `1` with opacity in `150ms`; hidden rows muted; active dot `5.25px` primary; drag handle `24.5px` × `28px`, `5.25px` radius, muted, hidden → `0.5` on row hover → `1` on its hover; drag preview card background, `0 8px 24px -6px rgb(0 0 0 / 0.25)`, content-border ring; placeholder `0.3`; rows move in `200ms cubic-bezier(0, 0, 0.2, 1)`; footer `3.5px` margin and padding over a content border, reset `28px`, `8.75px` padding, `7px` radius, `11.375px` primary, hover 9% primary. Collapsed: "Filters" button `35px`, `10.5px` padding, `7px` gap, `7px` radius, `12.25px` weight 500, ground background, text colour, inset ring, hover background, active-count `18px` primary pill; panel under the bar `7px` down, full width up to `504px`, max `min(70vh, 420px)`, `14px` padding and gap, `14px` radius, card background, content-border ring, overlay shadow, enters in `160ms cubic-bezier(0.2, 0, 0, 1)` from `translateY(-6px) scale(0.98)`; footer `14px` over a content border.

- [x] `<tx-filters-panel>` with `[txFilterField]` (makes the kit controls inside it `fluid`, like the first app's `w-full` fields) (`key`, `filterLabel`, `filterActive`) at any depth, `variant` `card` / `plain`, `busy` (every field turns into a skeleton of its label and control, same size — our own look instead of the first app's dimming), `[txFiltersActions]` slot; the `filter-slash` icon redrawn as a funnel with a cut corner and a cross
- [x] "Show filters" menu: `stateKey` + `stateStorage`, `defaultVisible`, check to show / hide, drag to reorder, counter, reset to default, fields with a value locked on, `reset()`; old array value read
- [x] Collapsed below 1024px (`collapse` `auto` / `always` / `never`): "Filters" button with the active count, all fields in a panel under the bar, outside click (not in overlays) / Escape close it, `[txFiltersReset]` action moves into the panel as "Clear filters"
- [x] `hasFilterValue` pipe
- [x] Accessibility: `search` landmark, menu button `aria-haspopup` / `aria-expanded` / translated label with the hidden count, `menuitemcheckbox` rows with `aria-checked`, locked rows disabled with a hint, toggle button `aria-expanded` / `aria-controls`, translated texts
- [x] Docs + tests; e2e: hide / show a field and the order survive a reload, drag reorders the fields, a field with a value stays, below 1024px the button opens the panel and an outside click closes it

## 10.2 Page header — `blocks/page-header` (186) ✅

First app (186): `title` (required, an `<h1>`), `subtitle` (185 of 186 use it, often a count), actions projected on the right — buttons (44), tabs (4), pills (4); the space below is set from the outside (`mb-6`, 132). A solid `secondary` button among the actions gets the card background and the content border with a hover background (the first app also adds its card ring, which doubles the border on a button — left out), so a "Back" button stays visible on the page background.

The look (rem × 14px): wrap, items at the end, `14px` gap; heading a column with `1.75px` gap; title `17.5px` weight 600, line height `1.25`, `-0.02em`, text colour; subtitle `12.25px` / `17.5px`, tabular digits, muted; actions `7px` gap, left out when empty.

- [x] `<tx-page-header>`: `title`, `subtitle`, `headingLevel` (a real `h1`–`h6`, `1` by default), actions slot, the card look of solid secondary buttons
- [x] Docs + tests; e2e: actions next to the title and under it on a narrow screen, solid vs outlined secondary look

## 10.3 Empty state — `blocks/empty-state` (193)

"Nothing here yet": tinted round icon, optional title, muted text, projected actions.

## 10.4 Console layout — `blocks/console-layout` (10)

Chrome of an app inside an app: header with brand and route crumbs, icon rail, footer, optional sticky left panel.

## 10.5 App layout — `blocks/app-layout` (22)

Sidebar + topbar + menu, responsive.

## 10.6 Wizard — `blocks/wizard` (53)

Full-screen step-by-step layout: two columns, segmented progress, step head, animated stage, back / skip / next footer.

## 10.7 Pinned tabs — `blocks/pinned-tabs` (1)

Quick-switch tabs for a filter with many values: the user pins values in a dialog, they show as tabs next to "All"; stored.

## 10.8 Command palette — `blocks/command-palette` (13)

Top-bar search button + ⌘K / Ctrl K window with grouped results, keyboard navigation, router navigation.

## 10.9 Kanban — `blocks/kanban` (6)

Columns of cards, drag and drop of cards (inside and between columns) and of columns; emits drop events only.

## 10.10 Actions menu and action tile — `blocks/actions-menu`, `blocks/action-tile` (6, 1)

Outlined "more" button with a popover list of actions; full-width clickable tile (icon, title, text, chevron).

## 10.11 Preferences — `blocks/topbar-preferences`, `blocks/switch-theme`, `blocks/switch-language` (12, 1, 2)

Theme button with a circle reveal (also a directive), segmented language switch, both in one capsule or as rows.

## 10.12 Public chrome — `blocks/public-header`, `blocks/app-footer`, `blocks/cookie-notice` (5, 7, 4)

Header of public pages with a burger below tablet width, footer with `© year name` and links, essential-cookies notice.

## 10.13 Network status — `blocks/network-status` (4)

Offline banner and "Connection restored" for 3 seconds.

## 10.14 QR code — `blocks/qr-code` (1)

A string drawn as a QR code (own encoder, no dependency).

## 10.15 Confetti and hover effect — `blocks/confetti`, `blocks/hover-effect` (7, 0)

One-time confetti burst; 3D tilt that follows the pointer.
