# Stage 4 — feedback & display, detailed checklist

Part of [ROADMAP.md](../ROADMAP.md). One section per item, in the order we build them. Tick a box only when the code, the docs example and the test for it exist.

Sources: PrimeNG 22 component APIs and what the first consumer app needs (usage = tags in its templates, 2026-11-05).

**Every item also needs** (not repeated below): tokens in `packages/themes/src/components/`, `dt` / `pt` / `ptOptions` / `unstyled`, README (Inputs / Outputs / Slots / Keyboard), docs page with an example per feature, unit tests, e2e page check (light + dark, axe), lint clean. Severities map the same way as in button / badge / message.

---

## 4.1 Overlay badge — `ui/overlay-badge` ✅

PrimeNG: OverlayBadge (`value`, `severity`, `size`, `badgeDisabled`) around any content. First app usage: 0 tags (its own wrapper has `value`).

- [x] `<tx-overlay-badge>`: `tx-badge` on the top-end corner with a ring in the surface colour, `value` (number / text, dot without a value), `severity`, `size`, `max` (`99+`), `hidden`, zero hides itself unless `showZero`
- [x] Position for round content (`shape="circle"`), offset and ring tokens (`overlayBadge`)
- [x] Accessible: `ariaLabel` on the badge, the badge is added to the `aria-describedby` of the focusable content
- [x] Docs + tests: on icons, buttons, avatars, dot, max, severities, sizes, zero, design tokens; e2e: corner position, read with the button. Docs: new navigation group "Display" (Badge moved from Misc)

## 4.2 Pill — `ui/pill` ✅

Not in PrimeNG as such (Tag rounded). First app usage: **1225** tags: `tone` (`neutral`, `primary`, `success`, `info`, `warn`, `danger`), `size` (`small` 1027×), `variant` (`soft`, `solid`, `outline`), `icon` (721×), `removable` + `removeLabel` + `(removed)`, a `[pillLeading]` slot.

- [x] `<tx-pill>`: the first app's tones (+ `help`, `contrast`), `soft` / `solid` / `outline`, `small` / `medium` (`normal` alias) / `large`, icon (name, `pi-` name, class), `value` or content, `txPillLeading` slot; text keeps AA (700 shades in light, solid on 700)
- [x] Removable: button with a translated label (us / ua "Remove"), `(removed)`, Enter / Space / Delete / Backspace on the button
- [x] Dot indicator (`dot`) for status lists
- [x] Docs + tests: tones, variants, sizes, icons, dot, removable, leading, in a table, design tokens; e2e: keyboard removal

## 4.3 Tag + Chip — `ui/tag`, `ui/chip` ✅

PrimeNG: Tag (`value`, `severity`, `rounded`, `icon`), Chip (`label`, `icon`, `image`, `removable`, `removeIcon`, `(onRemove)`). First app: tag 30 (`value`, `severity`, `icon`, `rounded`, `size` normal / large, `removable`, `copyable`, `(changeTag)`), chip 0 tags (`label`, `icon`, `removable`, `(remove)`).

- [x] `<tx-tag>`: value or content, eight severities on a tint (AA text), `rounded`, icon, `small` / `medium` (`normal` alias) / `large`, `removable` + `(removed)`, `copyable` (copies the text, check icon and "Copied" label for a moment, `(copied)`); `tag` tokens
- [x] `<tx-chip>`: label, icon, round image (avatar), removable with own `removeIcon` and translated label, `(removed)`, Delete / Backspace on the remove button; `chip` tokens
- [x] Docs + tests: severities, rounded, icons, sizes, copy, remove, chip with icons / images / recipients, design tokens; e2e: copy to the clipboard, keyboard removal

## 4.4 Progress bar + progress spinner — `ui/progress-bar`, `ui/progress-spinner` ✅

PrimeNG: ProgressBar (`value`, `showValue`, `unit`, `mode` determinate / indeterminate, `color`, content template), ProgressSpinner (`strokeWidth`, `fill`, `animationDuration`). First app: progress bar 34 (`value`, `showValue`, `mode`, `color`, `size` normal / small), loader 25 (`width`, `height`).

- [x] `<tx-progress-bar>`: value within `min` / `max` (clamped), `showValue` + `unit` (`%` or the value with a unit) + `txProgressBarValue` template, `mode="indeterminate"` (busy, slides; pulses with reduced motion), eight severities and own `color`, `small` / `medium` (`normal` alias) / `large`, `role="progressbar"` with value text and a translated default name; width animates
- [x] `<tx-progress-spinner>`: `small` / `medium` / `large` or px, `strokeWidth`, `fill`, `animationDuration`, `color`, busy `progressbar` named "Loading" (us / ua) by default; reduced motion turns slowly instead of stopping
- [x] Docs + tests: values, label, severities, indeterminate, sizes, units, template, live upload, spinner sizes / stroke / colours / inline, design tokens; e2e: value grows to 100 with the fill width, busy indeterminate bar

## 4.5 Skeleton — `ui/skeleton` ✅

PrimeNG: Skeleton (`shape` rectangle / circle, `size`, `width`, `height`, `borderRadius`, `animation` wave / none). First app: a table skeleton with `lineNumbers`.

- [x] `<tx-skeleton>`: rectangle / circle, `size` / `width` / `height` / `borderRadius`, wave animation (off with reduced motion and `animation="none"`), `aria-hidden`
- [x] Ready layouts: text lines (`lines`, last line shorter), `<tx-skeleton-table>` (`rows`, `columns`, `header`)
- [x] Docs + tests: shapes, lines, card / list / table layouts, loading swap with `aria-busy`, no animation, design tokens; e2e: placeholder while loading, hidden from screen readers

## 4.6 Avatar — `ui/avatar` ✅

PrimeNG: Avatar (`label`, `icon`, `image`, `size`, `shape`, `(onImageError)`), AvatarGroup. First app: user avatar 186 (`src`, `name`), avatar 6 (editable photo), user image 10 (a group with `limit` and an add button).

- [x] `<tx-avatar>`: image → initials from `name` → icon fallback (a broken image falls back too and resets when the image changes), `label`, sizes (`small` … `xlarge` + px, text scales), circle / square, colour picked from the name out of six tones (or `tone`), `(imageError)`, named by `name` / `ariaLabel` (`role="img"`, decorative otherwise)
- [x] `<tx-avatar-group>`: overlap proportional to each avatar's size, ring in the surface colour, `max` with `+N` (translated "N more"), `txAvatarGroupEnd` slot for an add button, size / shape passed to the avatars, `role="group"`
- [x] Status dot / badge on the avatar through `tx-overlay-badge` (`shape="circle"`)
- [x] Docs + tests: image, initials, fallback, sizes, shapes, group with max, status, labels, design tokens; e2e: broken image → initials, group +N. The first app's editable avatar (upload / remove with a confirm modal) waits for stage 5 dialogs

## 4.7 Divider, card / panel, fieldset — `ui/divider`, `ui/card`, `ui/panel`, `ui/fieldset` ✅

PrimeNG: Divider (`layout`, `type`, `align`, content), Card (header / title / subtitle / content / footer), Panel (`header`, `toggleable`, `collapsed`, templates), Fieldset (`legend`, `toggleable`, `collapsed`). First app: panel 139 (`title`, `subtitle`, `icon`, `align`, `variant` card / inset / plain, actions in the header).

- [x] `<tx-divider>`: horizontal / vertical (stretches to the row), solid / dashed / dotted, content aligned start / center / end, `role="separator"` with `aria-orientation`; `divider` tokens
- [x] `<tx-card>`: `txCardHeader` media, `title` (heading, `headingLevel`) or `txCardTitle`, subtitle, content, `txCardFooter` pinned to the bottom in a grid; `card` tokens
- [x] `<tx-panel>`: title (names the `region`), subtitle, icon in a tinted square, `txPanelActions` / `txPanelHeader` / `txPanelFooter`, `variant` card / inset / plain, `align`, `toggleable` with `[(collapsed)]` (grid-rows animation, `inert` and hidden when closed); `panel` tokens
- [x] `<tx-fieldset>`: native `fieldset` + `legend` (text or `txFieldsetLegend`), toggleable / collapsed from a legend button; `fieldset` tokens
- [x] Docs + tests: every variant, cards in a grid, toggle by click and keyboard, `aria-expanded` / `aria-controls`; e2e: panel and fieldset collapse by click, Enter and Space, vertical divider height. Docs: new navigation group "Layout". Soft pill and tag text moved to the 800 shade in light (AA on a white card)

## 4.8 Text helpers — `ui/highlight-text`, `ui/amount`, `ui/status-icon`, `ui/link` ✅

Not in PrimeNG. First app: highlight text 59 (`text`, `highlight`), amount 79 (`amount`, `currency`, `format`, `strong`), status icon 14 (`status`, tooltip), link view 252 (`link`, `type` url / email, `copyBtn`, `linkText`, `highlight`, `maxLength`, `routerLink`), icon link 8 (`icon`, `text`, `routerLink`, `href`).

- [x] `<tx-highlight-text>`: marks every match (case and accent insensitive, combining marks stay with their letter), several terms, `caseSensitive`, `<mark>` with tokens (new `yellow` palette), text never parsed as HTML; `highlightParts()` for own markup
- [x] `<tx-amount>`: number / money through the locale (`Intl`, current tectra locale or `locale`), ISO currency with `currencyDisplay` (unknown codes shown as is), digits `format` (`1.0-2`), `compact`, `showSign` + `signColor`, muted zero, dash when empty (`emptyText`), `strong`; `formatAmount()` for own markup
- [x] `<tx-status-icon>`: on / off (`status`) or `severity` icon, named "Yes" / "No" (us / ua) or by `label` / `toolTip`, native title until the stage 5 tooltip, decorative without a name, sizes
- [x] `<tx-link>`: url (adds `https://`) / email (`mailto:`) / phone (`tel:`), `linkText`, shortened text (`maxLength`, full text in the title), highlight, copy button (`copyable`, translated label, `(copied)`), new tab with an arrow icon, `rel="noopener noreferrer"` and a hidden "opens in a new tab", `routerLink`; `<tx-icon-link>`: router link with the active state and `aria-current`, external link, or a button. `@angular/router` is a peer of `@tectra-ng/ui`
- [x] Docs + tests: each part, copy, router link, highlight with the search, amounts and status icons in tables, locales; e2e: highlight follows typing, copy to the clipboard, new tab attributes, in-app navigation, active icon link
