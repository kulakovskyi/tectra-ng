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

## 4.2 Pill — `ui/pill`

Not in PrimeNG as such (Tag rounded). First app usage: **1225** tags: `tone` (`neutral`, `primary`, `success`, `info`, `warn`, `danger`), `size` (`small` 1027×), `variant` (`soft`, `solid`, `outline`), `icon` (721×), `removable` + `removeLabel` + `(removed)`.

- [ ] `<tx-pill>`: the first app's tones (+ `help`, `contrast`), `soft` / `solid` / `outline`, `small` / `medium` / `large`, icon (name, `pi-` name, class, template), text or content
- [ ] Removable: button with a translated label, `(removed)`, Backspace / Delete on the focused pill
- [ ] Dot indicator (`dot`) for status lists
- [ ] Docs + tests: tones × variants, sizes, icons, removable, in a table cell

## 4.3 Tag + Chip — `ui/tag`, `ui/chip`

PrimeNG: Tag (`value`, `severity`, `rounded`, `icon`), Chip (`label`, `icon`, `image`, `removable`, `removeIcon`, `(onRemove)`). First app: tag 30 (`value`, `severity`, `icon`, `rounded`, `size` normal / large, `removable`, `copyable`, `(changeTag)`), chip 0 tags (`label`, `icon`, `removable`, `(remove)`).

- [ ] `<tx-tag>`: value or content, severities, `rounded`, icon, sizes, `removable`, `copyable` (copies the value, check icon after)
- [ ] `<tx-chip>`: label, icon, image (avatar on the left), removable with own remove icon, `(removed)`, keyboard removal
- [ ] Docs + tests: severities, rounded, icons, copy, remove, chip with image

## 4.4 Progress bar + progress spinner — `ui/progress-bar`, `ui/progress-spinner`

PrimeNG: ProgressBar (`value`, `showValue`, `unit`, `mode` determinate / indeterminate, `color`, content template), ProgressSpinner (`strokeWidth`, `fill`, `animationDuration`). First app: progress bar 34 (`value`, `showValue`, `mode`, `color`, `size` normal / small), loader 25 (`width`, `height`).

- [ ] `<tx-progress-bar>`: value 0–100 (and `min` / `max`), `showValue` + `unit` + value template, `mode="indeterminate"`, `severity` and own `color`, sizes, `role="progressbar"` with values / busy state
- [ ] `<tx-progress-spinner>`: size (px or `small` / `medium` / `large`), `strokeWidth`, `fill`, `animationDuration`, `role="progressbar"` + label; reduced motion slows down instead of stopping
- [ ] Docs + tests: values, label, indeterminate, colours, sizes, spinner sizes

## 4.5 Skeleton — `ui/skeleton`

PrimeNG: Skeleton (`shape` rectangle / circle, `size`, `width`, `height`, `borderRadius`, `animation` wave / none). First app: a table skeleton with `lineNumbers`.

- [ ] `<tx-skeleton>`: rectangle / circle, size / width / height / radius, wave animation (off with reduced motion), `aria-hidden`
- [ ] Ready layouts: text lines (`lines`), table rows (`rows`, `columns`)
- [ ] Docs + tests: shapes, card / list / table layouts

## 4.6 Avatar — `ui/avatar`

PrimeNG: Avatar (`label`, `icon`, `image`, `size`, `shape`, `(onImageError)`), AvatarGroup. First app: user avatar 186 (`src`, `name`), avatar 6 (editable photo), user image 10 (a group with `limit` and an add button).

- [ ] `<tx-avatar>`: image → initials from `name` → icon fallback (broken image falls back too), sizes (`small` … `xlarge` + px), circle / square, colour from the name, `(imageError)`
- [ ] `<tx-avatar-group>`: overlap, `max` with `+N`, add button slot
- [ ] Status dot / badge on the avatar (through `tx-overlay-badge`)
- [ ] Docs + tests: image, initials, icon, fallback, sizes, shapes, group with max

## 4.7 Divider, card / panel, fieldset — `ui/divider`, `ui/card`, `ui/panel`, `ui/fieldset`

PrimeNG: Divider (`layout`, `type`, `align`, content), Card (header / title / subtitle / content / footer), Panel (`header`, `toggleable`, `collapsed`, templates), Fieldset (`legend`, `toggleable`, `collapsed`). First app: panel 139 (`title`, `subtitle`, `icon`, `align`, `variant` card / inset / plain, actions in the header).

- [ ] `<tx-divider>`: horizontal / vertical, solid / dashed / dotted, content aligned start / center / end
- [ ] `<tx-card>`: header media, title, subtitle, content, footer slots
- [ ] `<tx-panel>`: title, subtitle, icon, header actions slot, `variant` (card / inset / plain), `align`, `toggleable` with `[(collapsed)]` and animation, footer
- [ ] `<tx-fieldset>`: legend (text or template), toggleable / collapsed
- [ ] Docs + tests: every variant, toggle by click and keyboard, `aria-expanded` / `aria-controls`

## 4.8 Text helpers — `ui/highlight-text`, `ui/amount`, `ui/status-icon`, `ui/link`

Not in PrimeNG. First app: highlight text 59 (`text`, `highlight`), amount 79 (`amount`, `currency`, `format`, `strong`), status icon 14 (`status`, tooltip), link view 252 (`link`, `type` url / email, `copyBtn`, `linkText`, `highlight`, `maxLength`, `routerLink`), icon link 8 (`icon`, `text`, `routerLink`, `href`).

- [ ] `<tx-highlight-text>`: marks every match (case and accent insensitive), several terms, `<mark>` with tokens
- [ ] `<tx-amount>`: number / money through the locale (`Intl`), currency, fraction digits, compact, sign colour, `strong`
- [ ] `<tx-status-icon>`: on / off (or severity) icon with an accessible label and a title until the stage 5 tooltip
- [ ] `<tx-link>`: url / email / phone, shortened text (`maxLength`), highlight, copy button, external icon + `rel`, `routerLink`; icon link variant
- [ ] Docs + tests: each part, copy, router link, highlight with the search
