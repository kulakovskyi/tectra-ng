# @tectra/core

Behaviour without looks. Every component of `@tectra/ui` stands on it. Built on `@angular/cdk`.

| Entry point | What it does |
|---|---|
| `@tectra/core/config` | `provideTectra({ preset, mode, darkSelector, ripple, unstyled, pt, ptOptions, translations })` — global config, writes theme CSS variables; `injectUnstyled`, `injectPassThrough` (objects or `({ instance }) => …` functions, `mergeSections` / `mergeProps`) for components |
| `@tectra/core/overlay` | open a panel next to an element: position, flip at the screen edge, `appendTo`, close on outside click / scroll |
| `@tectra/core/a11y` | focus trap, keyboard navigation over lists, unique ids, live announcer |
| `@tectra/core/forms` | base for `ControlValueAccessor` + disabled / invalid / touched state, signal forms support |
| `@tectra/core/i18n` | built-in texts ("No results", week days…), RTL direction |
| `@tectra/core/styles` | `TxStyleLoader` — loads global styles of directive-based components once |
| `@tectra/core/ripple` | `txRipple` — ink wave: grows from the pointer while pressed, fades on release, starts from the centre on Enter / Space, calm fade with reduced motion. On with `provideTectra({ ripple: true })` or `[ripple]`; `rippleCentered`, `rippleColor`, `rippleDisabled`; tokens `--tx-ripple-{color,opacity,enter-duration,exit-duration,easing}` |
| `@tectra/core/fluid` | `<tx-fluid>` / `[txFluid]` — every fluid-aware component inside takes the full width |
| `@tectra/core/utils` | `optionalBoolean` input transform |

Depends on: `@tectra/themes`, `@angular/core`, `@angular/cdk`.
