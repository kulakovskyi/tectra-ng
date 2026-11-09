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

## 10.3 Empty state — `blocks/empty-state` (193) ✅

First app (254 tags): `icon` (252, `pi-inbox` by default), `text` (237), `title` (125), `variant` `plain` / `framed` / `inset` (124), `size` `compact` / `normal` / `large` (58), `tone` `primary` (default) / `neutral` / `success` / `info` / `warn` / `danger` (49), actions projected under the text; a `status` region.

The look (rem × 14px): a centred column, `10.5px` gap, `35px 21px` padding; icon `42px` circle with a 12% tint of the tone and the tone colour, `17.5px` glyph; body `3.5px` gap; title `14px` weight 600; text `12.25px`, line height `1.375`, muted, up to `392px`. `framed`: card background, content-border ring, `10px` radius, at least `252px` high, `49px 21px`. `inset`: ground background, `10px` radius, `28px 21px`. `large`: `42px 28px`, icon `49px` with a `14px` radius and a `21px` glyph, title `17.5px`. `compact`: a row from the start, `8.75px` gap, `14px` padding, icon `28px` with a `12.25px` glyph. Tones: primary, muted, green / sky / orange / red 600 (light) and 400 (dark).

- [x] `<tx-empty-state>`: `icon`, `title`, `text`, `variant`, `size`, `tone`, actions slot, `status` role
- [x] Docs (inside a table's `txTableEmpty`, a search without results) + tests; e2e: the empty state gives way to rows and comes back, clearing the search, compact row and large icon

## 10.4 Console layout — `blocks/console-layout` (10) ✅

First app (consoles of 4 apps): the frame of an app inside an app — a sticky header (the topbar: flex, space between, at least `56px`) with an app switcher cell as wide as the rail, the brand (logo, title, muted second word, home link) and crumbs from the `data` key of the active routes, header actions; an icon rail of sections (router links, exact match for home, subset for sections); the page; the app footer in its `console` variant; the browser tab title `<last crumb> · <name>` and favicon while the console is open, restored on leave; a translate function for crumbs, rail and footer labels. `console-panel`: a sticky left list or tree next to the page that takes over the footer.

The look (rem × 14px): ground background, full window height. Header: card background, bottom content border, `8.75px 21px 8.75px 0` padding, `14px` gap; apps cell `84px`; trail `10.5px` gap, `19.25px` start padding; brand `8.75px` gap, logo `28px`, title `14px` weight 600, muted word weight 500; slash in the border colour `15.75px`; crumbs `12.25px` muted, the current one weight 600 in the text colour. Rail `84px`, `10.5px 5.25px` padding, `3.5px` gap, card background, end border; items a column, `7px 3.5px`, `3.5px` gap, `10px` radius, `11px` / `1.25`, muted, icon `17.5px`; hover background and text colour; active 14% primary 500 (18% on hover), primary text, weight 600; focus outline `2px` primary, offset `2px`. Content `21px`. Below 768px: the rail is a row under the header (`5.25px 7px`, items at least `72px`), header end padding `14px`, apps cell `14px` start padding, trail `10.5px`, the muted word, slashes and crumbs hidden, content `14px`. Panel: `236px` column, card background, end border, nav sticky under the header, `14px 10.5px`; the aside slides in from the left `420ms cubic-bezier(0.22, 1, 0.36, 1)`, the page fades in `280ms` after `60ms`; below 1024px a bar above the page (bottom border, slides down `8px`; the open list `10.5px`), the page `14px`. Its offset matches the content padding at every width (the first app's `-14px` below 1024px left a `7px` gap between 768px and 1023px).

- [x] `<tx-console-layout>`: brand (at the edge when there is no app switcher), crumbs from route data or `crumbs`, rail (`routerLink` + `queryParams` + `activeOptions`, `url`, `command` + `active`), apps / actions slots, footer, `documentTitle` / `favicon` restored on destroy, `translate`, sticky header and rail with `topOffset` / `viewportHeight` tokens; `responsive` `viewport` (default, like the first app) or `container` — the same `768px` / `1024px` rules as container queries on the console width (in px, since container `rem` follows the 14px root), for a console in a frame
- [x] `<tx-console-panel>`: sticky aside, takes the footer under its page, motion off with reduced motion; below 1024px a folded bar (our addition — the first app shows the whole list there): a `label` button opens the list with a row animation, it closes after a link, on navigation and on Escape
- [x] `blocks/app-footer` (needed here, item of 10.12): `© year name`, legal links (`routerLink` or `url`), `page` / `app` / `console` variants, translated "Legal" label
- [x] Docs + tests; e2e: sections switch page and crumbs, header and rail stay while the page scrolls, router sections follow the address, the panel takes the footer and becomes a bar below 1024px, the rail is a row below 768px

## 10.5 App layout — `blocks/app-layout` (22) ✅

First app (every signed-in app): the shell with a menu model of sections, logo and app name, the top bar end slot, the page, a footer slot, a backdrop (`spectrum` — primary, purple, cyan; `accent` — primary shades, both over the ground with a grain), a plain mode without the sidebar (logo + name in the top bar). Every app runs the `drawer` menu mode (the other five modes are unused and not ported): a rail of icons that opens on hover over the page, a pin button that keeps it open and moves the page, the pin state kept in `localStorage`; below 1024px a burger in the top bar, the menu slides in over a mask. Theme and accent come from `provideTectra` / `createTectraPreset`, so its layout service is not ported.

The look (rem × 14px): rail `73.5px`, open `224px`, width `0.3s cubic-bezier(0, 0, 0.2, 1)`; card background, end border; header `56px`, bottom border, `0 17.5px 0 21px` when open, logo `24.5px`, name `14.875px` weight 700 `-0.02em` fading in with the menu labels (`0.3s` in, `0.1s` out — the first app shows it only after `300ms`, which looked late); pin button — our own look instead of the first app's `16.1px` filled circle: a `28px` quiet icon button (`angle-double-left` to fold, `thumbtack` to pin) with a tooltip; menu `7px 0 28px`, the sidebar menu of `tx-panel-menu` with a new `collapsed` look (one column of icons with no nesting indent, labels and section titles fade, badges `15.75px` at `2.625px / 26.6px` with a `2px` ring, locks in a `15.75px` ground circle). Top bar at least `56px`, `10.5px 16.1px 10.5px 0`; menu button `35px`, `7px` radius, `17.5px` icon, `21px` after it, `16.1px` start padding. Page `21px 28px 14px` (`14px` below 1024px), at most `1504px` wide. Plain top bar `21px` sides, logo `28px`, name `17.5px` weight 600.

- [x] `<tx-app-layout>`: `model`, `logo`, `title`, `homeLink`, `sidebar`, `[(anchored)]` + `stateKey`, `backdrop` / `backdropVariant`, top bar / footer slots; the rail opens on hover and on keyboard focus (our addition); the mobile menu closes after a pick, on navigation, on the mask and on Escape, and is inert while closed; `responsive` `viewport` or `container` (contains the mobile menu, mask and backdrop)
- [x] `tx-panel-menu` `collapsed` (sidebar rail look); opening is smooth: labels never wrap (rows keep their height), nesting indents slide with the width, chevrons fade, badges settle at their new place
- [x] Docs (screens, device frames) + tests; e2e: the rail opens over the page without moving it, pin / unpin moves the page, the phone menu slides in and closes after a pick, the plain top bar

## 10.6 Wizard — `blocks/wizard` (53) ✅

First app (onboarding of three apps): a layout with header / body / footer / visual slots, a segmented progress (`total`, `current`, `label`, `stepLabels`), a step head (`title` as `h1`, `icon`, `lead`, `badge`), a stage (`direction`, `number`, `caption`, backdrop slot, scenes that slide in and out by direction) and a footer (`nextLabel`, `nextIcon`, `backLabel`, `showBack`, `skipLabel`, `loading`; `back` / `next` / `skip`); steps rise in on enter.

The look (rem × 14px, breakpoints 640px / 1024px): card background, full window height; one column, the stage on top as a band; from 1024px two columns with a sticky stage of the window height. Step column up to `532px`, `21px 17.5px` → `21px 28px` from 640px → `35px 42px` from 1024px; main `28px` gap and padding. Progress `7px` gap, label `10.5px` weight 500 upper case `0.08em` muted, segments `5.25px` high and apart, border colour, primary fill sliding `500ms cubic-bezier(0.16, 1, 0.3, 1)`, the current one at `0.6`. Step head `10.5px` gap, icon `38.5px` square with a `10.5px` radius on 12% primary, `15.75px` glyph; title `21px` weight 600 `1.25` `-0.01em`; lead `13.125px` / `1.625` muted, up to `476px`; badge a small neutral pill. Stage 5% primary over the ground, `21px` gap (`35px` wide), `28px 21px` (`42px 21px` wide), at least `196px`; a `364px` square at half size on narrow screens; scenes in `680ms` from `56px` and `0.96`, out `260ms` to `-40px` and `0.98`, mirrored going back; caption from 1024px — the number `10.5px` weight 600 primary in two digits, the name `15.75px` weight 600, rising in `520ms`. Footer `10.5px` gap, `17.5px` top padding over a border, back outlined secondary, skip text secondary, next primary with its icon.

- [x] `tx-wizard-layout`, `tx-wizard-progress`, `tx-wizard-step-head`, `tx-wizard-stage`, `tx-wizard-footer`; `tx-wizard-step--enter`, `tx-wizard-scene` / `--enter` / `--leave` classes; translated default footer labels (our addition); `responsive` `viewport` or `container`
- [x] Docs (a four-step onboarding, device frames, parts) + tests; e2e: next / back move the steps with the progress and caption, the finish loads and starts over, the stage beside the step on a desktop and above it on a phone

## 10.7 Pinned tabs — `blocks/pinned-tabs` (1) ✅

First app: pills tabs "All" + the pinned values (in the option order) next to an outlined secondary small "Customize" button (labelled while nothing is pinned, a square icon with a tooltip next to tabs, disabled without options); a settings dialog with a hint, a "Selected: N of M" counter and a grid of toggle tiles with a check circle, Cancel / Save; the choice in `localStorage` under the key; `selected` + `selectedChange` (here `[(selected)]`).

The look (rem × 14px): `7px` between tabs and button. Dialog `17.5px` gap, section `8.75px`, counter `10.5px` weight 500 muted; tiles `minmax(175px, 1fr)` `7px` apart, up to `50vh`; a tile `42px`, `0 10.5px 0 14px`, `10.5px` radius, `12.25px` weight 500, ground background, a transparent inset ring → hover background with a border ring, pressed `0.985`; selected 12% primary with a 55% primary ring (18% / primary on hover); check `17.5px` circle with a `1.5px` 45% muted ring, the check `8.75px` scaling `0.5` → `1`, filled primary when selected; `150ms ease-out`; full-width Cancel / Save.

- [x] `<tx-pinned-tabs>`: `stateKey`, `options`, `allLabel`, `[(selected)]`, `dialogTitle` / `dialogText`, `openSettings()`; settings dialog on the kit dialog service; translated texts
- [x] Docs (tabs and a multiselect on one value above a table) + tests; e2e: pin in the dialog, tabs filter the table and stay after a reload, Cancel keeps nothing

## 10.8 Command palette — `blocks/command-palette` (13) ✅

First app (every app and console): a top-bar button (icon, label, ⌘K / Ctrl K hint; a square icon below 768px) and a window opened by the button or the shortcut: a search field, results in groups with an icon, label, sublabel and an arrow on the active row, "Searching…" and "Nothing found" rows, a hints footer; arrows wrap, Enter opens through the router, Escape closes; `queryChange`, a debounced `searchChange` (`minQueryLength`), `itemSelect`, `closed`; `localFilter`; pipes `commandPaletteFilter` and `menuPaletteItems`; the page does not scroll behind it.

The look (rem × 14px): button `37px`, `0 7px 0 10.5px`, `7px` gap and radius, card background, a 14% text-colour inset ring and `0 1px 2px` shadow → hover background, text colour and `0 2px 10px` shadow, pressed `0.97`; kbd `9.625px` weight 500 on the ground with a border ring. Mask `rgb(15 23 42 / 0.45)` with a `2px` blur, the window `12vh` from the top, up to `640px` × `70vh`, `14px` radius, border, card background, `0 24px 64px` shadow, in `180ms` from `-8px` and `0.98`; search `12.25px 14px`, `10.5px` gap, `15.75px` icon; results `7px`, group titles `9.625px` weight 600 upper case `0.05em` muted; rows `7px 10.5px`, `10.5px` gap, `7px` radius, `12.25px`, 10% primary when active; the icon box `28px` on the ground (14% primary when active); sublabel `10.5px` muted up to 45%; footer `8.75px 14px` on the ground with `10px` keys.

- [x] `<tx-command-palette>` with items that navigate (`routerLink` + `queryParams`) or run a `command`, translated default texts; the window is a dialog in the overlay container (above any stacking context — the first app renders it inside the button's parent) with a combobox (`aria-activedescendant`), a focus trap and focus back to the button
- [x] Docs (a local list from a menu, a server search, compact, tokens) + tests; e2e: the shortcut opens it, keys and Enter pick, the server search shows loading and nothing found, the page does not scroll behind it, the mask closes it and focus comes back

## 10.9 Kanban — `blocks/kanban` (6) ✅

First app (task boards): columns (`id`, `title`, `items`) with a title and a count pill, a card template, header / top / footer / empty templates, a slot after the last column; cards drag inside and between columns, columns drag by a handle; the board only emits `itemDropped` (`itemId`, `fromColumnId`, `toColumnId`, `beforeId`, `afterId`) and `columnDropped`; "Show N more" pages (`pageSize` 30); a fixed `height` scrolls inside the columns; the board scrolls sideways when dragged by its background.

The look (rem × 14px): `14px` between columns, `14px` under the board, at least `280px` high; columns `252px`, `10.5px` gap and padding, `10px` radius, card background with the card ring; header `28px` high with a `7px` gap, title `12.25px` weight 600; handle `21px`, `7px` radius, muted → hover background; lists `7px` gap, at least `49px`, a 5% primary tint while receiving; placeholders dashed `2px` 45% primary on 6% (cards at least `56px`); empty column `49px`, dashed border, `10.5px` muted; preview with the overlay shadow; moves `200ms cubic-bezier(0, 0, 0.2, 1)`. Our fixes: a `4px` inset around the scroll area so the column rings and focus rings are not clipped; "Show N more" fills the column width, scrolls to the first new card and moves the focus there.

- [x] `<tx-kanban>` with `txKanbanCard`, `txKanbanColumnHeader`, `txKanbanColumnTop`, `txKanbanColumnFooter`, `txKanbanEmpty`; keyboard moves (our addition — the first app has none): Alt + arrows move a card up, down or to the next column, Alt + Left / Right move a column by its handle, the move is announced and the focus follows; focusable scrolling columns; `focusableCards` off when the card template takes the focus itself
- [x] Docs (a task board in the first app's look — section header with add and menu, task cards, quick add on top / at the bottom, add section — that applies the moves; fixed height with pages, templates, tokens) + tests; e2e: keyboard and pointer moves between columns, a column moves, a fixed board pages and scrolls to the new cards, column rings stay unclipped, quick add

## 10.10 Actions menu and action tile — `blocks/actions-menu`, `blocks/action-tile` (6, 1) ✅

Outlined "more" button with a popover list of actions; full-width clickable tile (icon, title, text, chevron).

The look (rem × 14px): actions menu — outlined secondary `⋯` button (`small` = `30px`), the list `168px` wide at least with `5.25px` padding (no extra popover padding) and a `1.75px` gap, actions `7px 10.5px`, `7px` radius, `12.25px` weight 500, icon gap `8.75px`, text-button hovers, red for `danger`. Tile — `12.25px` gap and padding, `10px` radius, card background with a `1px` border ring → primary ring and hover background, a `35px` icon square on 12% primary, title `13.125px` weight 600, text `12.25px` muted, the chevron moves `1.75px` and turns primary on hover, spinner while loading, 60% when disabled.

- [x] `<tx-actions-menu>`: `items` (`id`, `label`, `icon`, `danger`), `tooltip`, `size`; emits `itemSelect` once the menu has closed; menu roles, arrows / Home / End, focus back to the button (our addition — the first app has no keyboard moves)
- [x] `<tx-action-tile>`: `icon`, `title`, `text`, `loading`, `disabled`, `tileClick`
- [x] Docs (header menu, sizes, a confirm from a table row, tokens; recovery methods with loading, states, tokens) + tests; e2e: keyboard and focus return, single padding, confirm after close, tile loading; the kanban example uses the small actions menu as in the first app

## 10.11 Preferences — `blocks/topbar-preferences`, `blocks/switch-theme`, `blocks/switch-language` (12, 1, 2) ✅

Theme button with a circle reveal (also a directive), segmented language switch, both in one capsule or as rows.

The look (rem × 14px): theme button `37px` round on the card colour with a 14% text ring and a small shadow, hover background, `0.9` press; sun and moon swap with a `90°` turn and a `0.5` scale in `500ms cubic-bezier(0.34, 1.56, 0.64, 1)`; the circle grows from the click in `550ms cubic-bezier(0.4, 0, 0.2, 1)`. Language switch `37px` high with `3px` padding on the ground colour and a border ring, a card-coloured thumb sliding in `300ms cubic-bezier(0.34, 1.3, 0.64, 1)`, codes `10.5px` weight 600 `0.04em`, at least `35px` wide with `10.5px` padding, muted → text colour. Capsule `3px` padding and `3.5px` gap, controls `31px`, a `1px × 14px` divider; raised — card colour, shadow, a 12% primary thumb with a 28% ring and a primary code; stacked rows `7px` apart with `12.25px` weight 500 muted labels.

- [x] `<tx-switch-theme>` and `[txThemeReveal]` on `TxThemeService` (`modeChange`, `themeChange`, `revealDuration`, `revealEasing`); during the circle the CSS transitions and named view transitions are off so the whole page reveals at once; no circle without the View Transitions API or with reduced motion
- [x] `<tx-switch-language>` on `TxLocaleService` (`languages`, two-way `value`, `syncLocale`); radio roles with arrows / Home / End (our addition — the first app has none)
- [x] `<tx-topbar-preferences>`: `layout` inline / stacked, `raised`, `languageChange`, `modeChange`
- [x] Docs (button, the directive on any control, own languages without the locale, plain and raised capsules, rows, tokens) + tests; e2e: theme and label switch, keyboard language switch with the thumb and the locale, capsule geometry

## 10.12 Public chrome — `blocks/public-header`, `blocks/app-footer` ✅ (built in 10.4), `blocks/cookie-notice` (5, 7, 4) ✅

Header of public pages with a burger below tablet width, footer with `© year name` and links, essential-cookies notice.

The look (rem × 14px): header sticky, `56px` high, content up to `1064px` with `17.5px` sides and `21px` gaps, card colour at 78% with a `24px` blur and a bottom border; brand `15.75px` weight 600 `-0.02em` with a `28px` logo; links `7px 10.5px` round, `12.25px` muted → text; preferences and actions `10.5px` / `7px` apart; below `768px` a `35px` round burger with a border ring opens a card-coloured panel (`10.5px 17.5px 17.5px`, `14px` gaps, overlay shadow, `200ms` slide-in) with `14px` text links divided by borders, stacked preferences and full-width buttons. Cookie notice: bottom-left card `336px` wide `21px` from the edges (full width with `14px` insets on phones), `14px` padding and radius, card colour at 84% with a blur, border ring and overlay shadow; a `31.5px` tinted shield, title `12.25px` weight 600, text `11.375px` muted, a primary "Learn more" link and a small "Got it" button; slides in after `600ms` in `500ms`.

- [x] `<tx-public-header>`: `brand`, `logo`, `homeLink` (router or a plain link), `preferences`, `responsive` viewport / container; `txPublicHeaderNav` and `txPublicHeaderActions` slots; the panel closes on a link, Escape (focus back to the burger) and when it grows wide
- [x] `<tx-cookie-notice>`: translated texts with own overrides, `link` / `href`, `cookieName`, `maxAgeDays`, `sharedDomain`, `dismissed`, `show()`; no extra dependency for the cookie; nothing on the server, so no jump after hydration
- [x] Docs (sticky page, device frames, without preferences, tokens; notice in a frame with "show again", own texts, tokens) + tests; e2e: sticky row, burger panel and Escape, notice dismiss kept after a reload
- [x] Fix: the live region of announcements (toasts, moves) is hidden from sight without the CDK stylesheet
- [x] Fix: the burger panel of the header and the folded filters panel fade out on close as smoothly as they open (`leaveDuration` / `leaveEasing` tokens of the filters panel)

## 10.13 Network status — `blocks/network-status` (4) ✅

Offline banner and "Connection restored" for 3 seconds.

The look (rem × 14px): a pill centred `21px` above the bottom, card colour at 88% with a blur, border ring and overlay shadow, `7px 14px 7px 7px` padding, `8.75px` gap, `12.25px` weight 500; a `24.5px` round icon on a 14% tint — amber wifi while offline, green check once restored; in `450ms cubic-bezier(0.16, 1, 0.3, 1)`, out in `300ms`.

- [x] `<tx-network-status>`: browser `offline` / `online` events and `navigator.onLine`, in the browser only; `offlineText`, `restoredText`, `restoredDuration`, `bodyClass`, `statusChange`, `onOffline()` / `onOnline()`; a polite live region
- [x] Docs (buttons that play the events in a frame, own texts, tokens) + tests; e2e: real offline and back, the pill hides, its place

## 10.14 QR code — `blocks/qr-code` (1) ✅

A string drawn as a QR code (own encoder, no dependency).

The first app draws a canvas with an outside library: `data`, `size` 200, `margin` 1, `10px` corners, a translated "Unable to render QR code". Same inputs here, so it swaps in one to one and the library can go.

- [x] The engine is its own npm package `@tectra-ng/qr` (plain TypeScript, no dependencies, part of `tectra-ng`): `encodeQr`, `qrPaths`, `qrLayout`, `qrToSvg`, `qrToPng`; the block builds on it
- [x] Own encoder `encodeQr`: versions 1–40, levels L / M / Q / H, numeric / alphanumeric / UTF-8, Reed–Solomon, mask by penalty; checked bit for bit against reference matrices of that library (versions 1 to 40, every level, several masks)
- [x] `<tx-qr-code>` as an SVG (same on the server): `dotStyle` square / dots / rounded / soft, `eyeFrameStyle` and `eyeBallStyle` square / rounded / circle, `color`, `background`, `eyeColor`, `eyeBallColor`, linear or radial `gradient`, `logo` with a cleared area and level `H`, `download()` PNG / SVG, `toDataUrl()`, `toSvgString()` (our addition, asked for)
- [x] Docs (live text, a designer with every option and downloads, shapes, colours, logo, download, tokens) + tests; e2e: every code on the page scans back with the browser's barcode reader (where the browser has one), PNG download, live update

## 10.15 Confetti and hover effect — `blocks/confetti`, `blocks/hover-effect` (7, 0)

One-time confetti burst; 3D tilt that follows the pointer.
