# @tectra/core

Behaviour without looks. Every component of `@tectra/ui` stands on it. Built on `@angular/cdk`.

| Entry point | What it does |
|---|---|
| `@tectra/core/config` | `provideTectra({ preset, mode, darkSelector, ripple, unstyled, pt, ptOptions, locale, translations })` — global config, writes theme CSS variables; `injectUnstyled`, `injectPassThrough` (objects or `({ instance }) => …` functions, `mergeSections` / `mergeProps`) for components |
| `@tectra/core/overlay` | `TxOverlay.open(template \| component, { origin, placement, offset, viewportMargin, layer, scroll, matchWidth, closeOnEscape, closeOnOutsideClick, restoreFocus })` → `TxOverlayRef` with `placement()` after flips, `closed`, `close()`; `txPositions(placement, offset)` for `cdkConnectedOverlay` |
| `@tectra/core/a11y` | `txFocusTrap` (auto focus, restore focus), `nextListIndex` (arrows, Home / End, PageUp / PageDown, disabled items, loop), `TxTypeahead`, `TxAnnouncer`, `uniqueId` |
| `@tectra/core/forms` | base for `ControlValueAccessor` + disabled / invalid / touched state, signal forms support |
| `@tectra/core/i18n` | `TX_LOCALE_US`, `TX_LOCALE_UA`, `TxLocaleService` (`setLocale`, `translate`, `formatNumber`, `formatDate`, `monthNames`, `weekdayNames`), `injectTranslations()` signal |
| `@tectra/core/styles` | `TxStyleLoader` — loads global styles of directive-based components once |
| `@tectra/core/ripple` | `txRipple` — ink wave: grows from the pointer while pressed, fades on release, starts from the centre on Enter / Space, calm fade with reduced motion. On with `provideTectra({ ripple: true })` or `[ripple]`; `rippleCentered`, `rippleColor`, `rippleDisabled`; tokens `--tx-ripple-{color,opacity,enter-duration,exit-duration,easing}` |
| `@tectra/core/fluid` | `<tx-fluid>` / `[txFluid]` — every fluid-aware component inside takes the full width |
| `@tectra/core/utils` | `optionalBoolean` input transform |

Depends on: `@tectra/themes`, `@angular/core`, `@angular/cdk`.
