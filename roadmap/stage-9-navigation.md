# Stage 9 — navigation & structure, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs (Aura base theme) and what the first consumer app needs (usage = tags in its templates, 2026-11-06). The first app's preset does not override tabs, accordion, stepper, steps or breadcrumb, so where it renders PrimeNG the look is the Aura tokens on the first app's semantic values (content radius `lg` = `10px`, transition `0.15s`, focus ring `2px` primary with a `2px` offset, muted text). Root font size there is 14px, so `1rem` = 14px.

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean.

---

## 9.1 Tabs — `ui/tabs` ✅

PrimeNG: Tabs (`value`, `scrollable` with previous / next buttons, `lazy`, `selectOnFocus`, `showNavigators`, tab list / tab / tab panels / tab panel parts, disabled tabs, tab as a router link, active bar). First app (92 tags): its own tab control on an items array — `tabs` (`value`, `label`, `icon`, `tooltip`, `description` shown under the control while the tab is active, `badge` counter, `0` shown), `[active]` + `(tabChange)` 88, `variant` segmented / pills 64, `size` normal / small 28, `raised` 21, `orientation` vertical 3; the active tab scrolls into view (8px gap); the active tab pops in (`scale(0.94)` → 1, `220ms cubic-bezier(0.2, 0.9, 0.3, 1.2)`).

The look (rem × 14px). Segmented (the first app's default): track `3.5px` padding and gap, `10.5px` radius, content border, ground background, scrolls sideways; items share the width, `8.75px 10.5px` padding, `7px` gap, `7px` radius, weight 600, muted, active solid primary with the contrast colour, `200ms ease-out`. Small: track `1.75px`, `7px` radius; items `5.25px 7px`, `3.5px` gap, `12.25px` text, `5.25px` radius. Pills: content width, inline track with an inset ring instead of the border, `1.75px` gap, items `5.25px 10.5px`, `5.25px` gap, `11.375px` weight 500, hover text colour, active on the card background with the text colour and a `0 1px 2px` shadow + `1px` border ring. Raised: card background, inset ring of 14% text colour, `0 1px 2px` shadow; raised pills active tinted 12% primary with a 28% primary ring. Vertical: column, items start-aligned. Badge `17.5px` pill, `9.625px` weight 600 tabular, 14% muted tint (16% primary in pills, 24% contrast in segmented when active). Description `5.25px` under the control, `11.375px`, muted. Line (PrimeNG Tabs): list with a bottom content border on the content background, tabs `12.25px 14px`, weight 600, muted → text on hover → primary when active, `1px` primary active bar sliding `250ms cubic-bezier(0.35, 0, 0.25, 1)`, previous / next buttons `31.5px` with a fading shadow, panels `10.5px 14px 14px`.

- [x] `<tx-tabs>` with `tx-tab-list` / `tx-tab` / `tx-tab-panels` / `tx-tab-panel`, `[(value)]`, `variant` (`segmented` default like the first app, `pills`, `line` like PrimeNG), `size`, `orientation`, `raised`; items array (`tabs`, `ariaLabel`) with icon, tooltip, badge, description, disabled; `tabChange`
- [x] Scrolling: active tab into view, `scrollable` previous / next buttons (`showNavigators`), hidden scrollbar
- [x] Panels: eager content or `txTabPanelContent` template rendered on the first visit; `lazy` renders only the active one
- [x] Router links: `a[txTab]`
- [x] Accessibility (the active segmented badge sits on `primary-active` — the original 24% white tint fails AA): `tablist` / `tab` / `tabpanel`, `aria-selected` / `aria-controls` / `aria-labelledby`, roving tab index, arrows (by orientation), Home / End, Enter / Space, `selectOnFocus`, disabled tabs skipped
- [x] Docs + tests; e2e: arrows move and select, the active tab scrolls into view, navigator buttons, line active bar under the active tab

## 9.2 Accordion — `ui/accordion` ✅

PrimeNG: Accordion (`value`, `multiple`, `expandIcon` / `collapseIcon`, `selectOnFocus`, `onOpen` / `onClose`, panel / header / content parts, disabled panels, toggle icon template). First app (5 + 1): its own wrapper on an items array (`header`, `content`, `tone` info / success / warn / danger drawn as a `3px` inset bar on the left of the header) with header / content templates, `multiple` on by default, `[(activeIndex)]`, one icon for both states, open / close events with the index and header. Its global styles turn the accordion into a bordered box: every header has a `1px` content border on the sides and the bottom (the first one also on top), the content has the side and bottom borders and `15px` top padding.

The look: header `14px` padding, weight 600, `14px` text, muted → text on hover and when open, card background, toggle icon muted → text, focus ring offset `-1px`, first header top corners and last header bottom corners `10px` (square while the last panel is open); content `15px 14px 14px` on the card background in the text colour; `0.15s` transitions, open / close on grid rows like the kit's other collapsibles.

- [x] `<tx-accordion>` with `tx-accordion-panel` / `tx-accordion-header` / `tx-accordion-content`, `[(value)]`, `multiple` (on by default like the first app), disabled panels, `expandIcon` / `collapseIcon`, `opened` / `closed`; items array (`items`) with header / content templates and tones
- [x] Content: eager or a `txAccordionContent` template rendered on the first open; animated open / close, reduced motion
- [x] Accessibility: header `button` with `aria-expanded` / `aria-controls`, content `region` with `aria-labelledby`, arrows Up / Down, Home / End, Enter / Space, `selectOnFocus`
- [x] Docs + tests; e2e: open / close one and many, keyboard, tone bar, rounded bottom border of the last open panel

## 9.3 Stepper — `ui/stepper` ✅

PrimeNG: Stepper (`value`, `linear`, step list / step / step panels / step panel with an `activateCallback`, vertical step items, separators) and Steps (`model`, `activeIndex`, `readonly`, item `command`). First app (8): its own wrapper with `items` (`label`, `icon`, `description`, `disabled`, `command`), `[(activeIndex)]`, `readonly` (on by default; a step is clickable only with a `command`, kept in `tx-steps`), `variant` `default` (PrimeNG Steps) or `track` (6 of 8). Track: markers `31.5px` circles (`12.25px` weight 600, ground background, `1px` content-border ring, muted), label `12.25px` weight 600 muted, description `10.5px` muted, one line; done steps get a check on a 14% green tint with a 30% green ring and the label in the text colour; the active marker is solid primary and the label primary; `1px` line between steps (`45%` green when done), `14px` margins, min `28px`; button `5.25px 7px` padding with a hover background when clickable; a column below 40rem (560px).

The look of PrimeNG Stepper: number `28px` circle with a `2px` content border on the card background, muted → primary, `14px` weight 500 with a small shadow; title weight 500 muted → primary; `2px` separators, primary up to the active step; step padding `5.25px` gap `12.25px`; panels `10.5px 5.25px 14px` on the surface they sit on (Aura paints the content background, which shows as a slab outside a card). Steps: number font `16px`, label under the number, the line through the middle of the numbers.

- [x] `<tx-stepper>` with `tx-step-list` / `tx-step` / `tx-step-panels` / `tx-step-panel` (`txStepPanelContent` template with `activate`), `[(value)]`, `linear`, vertical `tx-step-item` with animated panels
- [x] `<tx-steps>` on an items array: `variant` `default` / `track`, `[(activeIndex)]`, `readonly`, item `command`, done / active / disabled states
- [x] Accessibility: steps as a list with `aria-current="step"`, tabs pattern for the stepper header (arrows, Home / End), disabled steps skipped
- [x] Docs + tests; e2e: linear stepper moves with the panel buttons only, track goes vertical below 560px

## 9.4 Breadcrumb — `ui/breadcrumb` ✅

PrimeNG: Breadcrumb (`model`, `home`, item `label` / `icon` / `url` / `routerLink` / `queryParams` / `target` / `disabled` / `command` / `title`, item and separator templates). First app: page crumbs in the console header (slash separators in the border colour, `15.75px`; crumbs muted and truncated, the current one weight 600 in the text colour) and parent links in a side panel (chevron separators). The look: no padding or background (the first app's crumbs sit inside headers), `7px` gaps, items muted → text on hover, `14px`, icons `14px` in the navigation icon colour, `10px` focus radius, current page weight 600 in the text colour.

- [x] `<tx-breadcrumb>`: `model`, `home`, `separator` `chevron` (default) / `slash`, router links and urls, commands, disabled items, item / separator templates, the last item is the current page
- [x] Accessibility: `nav` with a translated label, `ol` / `li`, separators hidden from screen readers, `aria-current="page"`
- [x] Docs + tests; e2e: commands go back along the path by mouse and keyboard, items on one line, router links navigate
