# @tectra/ui

ONE npm package, one entry point per component: `import { TxSelect } from '@tectra/ui/select'` — only the select lands in the bundle.

Every component folder looks the same (see `select/`):

```
select/
  src/
    select.component.ts|html|scss   the component (styles use only --tx-* variables)
    select.component.spec.ts        unit tests
    select-option.directive.ts      template slots (#option, #empty, …)
    select.tokens.ts                component tokens → docs "Theming" tab
    select.types.ts                 public types
  index.ts                          public API of the entry point
  ng-package.json                   makes it @tectra/ui/select
  README.md                         descriptions → docs "API" tab
```

Planned (~70): button, input, textarea, checkbox, radio, switch, input-number, input-mask, input-otp, password, slider, rating,
tooltip, popover, dialog, drawer, toast, menu, context-menu, confirm-popup,
select, multiselect, autocomplete, listbox, tree-select, chips, color-picker,
paginator, table, tree, tree-table, data-view, virtual-scroller, timeline,
datepicker, tabs, accordion, stepper, breadcrumb, menubar, splitter, card, toolbar, divider,
file-upload, image, carousel, avatar, badge, tag, progress, skeleton, spinner, editor …

Depends on: `@tectra/core`, `@tectra/icons`.
