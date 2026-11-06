# @tectra-ng/core

Behaviour without looks. Every component of `@tectra-ng/ui` stands on it. Built on `@angular/cdk`.

| Entry point | What it does |
|---|---|
| `@tectra-ng/core/config` | `provideTectra({ preset, mode, darkSelector, ripple, unstyled, pt, ptOptions, locale, translations })` — global config, writes theme CSS variables; `injectUnstyled`, `injectPassThrough` (objects or `({ instance }) => …` functions, `mergeSections` / `mergeProps`) for components |
| `@tectra-ng/core/overlay` | `TxOverlay.open(template \| component, { origin, placement, offset, viewportMargin, layer, scroll, matchWidth, closeOnEscape, closeOnOutsideClick, restoreFocus })` → `TxOverlayRef` with `placement()` after flips, `closed`, `close()`; `txPositions(placement, offset)` for `cdkConnectedOverlay`; `txOverlayInset` on sticky / fixed chrome (measured live, only while pinned) or `provideTectra({ overlay: { viewportInsets: { top, bottom } } })` keeps panels out of headers / footers and closes them once the origin scrolls under one (for custom `cdkConnectedOverlay` panels: `TxOverlayInsets` + `watchOrigin`, and `TxOverlayRoom` — bind its `positions()` and `viewportMargin()`, call `open(insets)` / `move(insets)` and `fit(origin, panel, overlay, injector)` on the first position change so the first placement with room around the chrome goes first; CDK alone compares top placements with the viewport edge) |
| `@tectra-ng/core/a11y` | `txFocusTrap` (auto focus, restore focus), `nextListIndex` (arrows, Home / End, PageUp / PageDown, disabled items, loop), `TxTypeahead`, `TxAnnouncer`, `uniqueId` |
| `@tectra-ng/core/forms` | base for `ControlValueAccessor` + disabled / invalid / touched state, signal forms support |
| `@tectra-ng/core/i18n` | `TX_LOCALE_US`, `TX_LOCALE_UA`, `TxLocaleService` (`setLocale`, `translate`, `formatNumber`, `formatDate`, `monthNames`, `weekdayNames`), `injectTranslations()` signal |
| `@tectra-ng/core/styles` | `TxStyleLoader` — loads global styles of directive-based components once |
| `@tectra-ng/core/ripple` | `txRipple` — ink wave: grows from the pointer while pressed, fades on release, starts from the centre on Enter / Space, calm fade with reduced motion. On with `provideTectra({ ripple: true })` or `[ripple]`; `rippleCentered`, `rippleColor`, `rippleDisabled`; tokens `--tx-ripple-{color,opacity,enter-duration,exit-duration,easing}` |
| `@tectra-ng/core/fluid` | `<tx-fluid>` / `[txFluid]` — every fluid-aware component inside takes the full width |
| `@tectra-ng/core/utils` | `optionalBoolean` input transform |

Depends on: `@tectra-ng/themes`, `@angular/core`, `@angular/cdk`.
