# @tectra/core

Behaviour without looks. Every component of `@tectra/ui` stands on it. Built on `@angular/cdk`.

| Entry point | What it does |
|---|---|
| `@tectra/core/config` | `provideTectra({ preset, locale, ripple, density })` — global config, writes theme CSS variables |
| `@tectra/core/overlay` | open a panel next to an element: position, flip at the screen edge, `appendTo`, close on outside click / scroll |
| `@tectra/core/a11y` | focus trap, keyboard navigation over lists, unique ids, live announcer |
| `@tectra/core/forms` | base for `ControlValueAccessor` + disabled / invalid / touched state, signal forms support |
| `@tectra/core/i18n` | built-in texts ("No results", week days…), RTL direction |

Depends on: `@tectra/themes`, `@angular/core`, `@angular/cdk`.
