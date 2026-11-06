---
category: Navigation
tokens: breadcrumb
examples: basic, separator, commands, disabled, template, design-tokens
---
# Breadcrumb

Shows where the current page sits in the hierarchy: links to the parent pages, ending with the current page. Each item of `model` is a `TxBreadcrumbItem` — `label`, `icon`, `routerLink` (+ `queryParams`, `fragment`), `url` + `target`, `command`, `disabled`, `title`, `ariaLabel`. The last item is the current page: it is not a link and carries `aria-current="page"`. Long labels are cut with an ellipsis; a trail wider than its box scrolls sideways.
