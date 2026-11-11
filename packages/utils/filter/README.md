# Filter

Search and filters for lists in code or templates, with the same rules as the table filters: case, accents and extra spaces do not matter, nested fields are reached by a path (`team.name`), and the table's match modes work on any list.

```html
@for (person of people() | txSearch: query() : ['name', 'email', 'team.name']; track person.id) { … }
```

## Pipes
| Name | Description |
|---|---|
| txSearch: query, fields | Items where any of the fields contains the query; all items for an empty query. `fields` — paths or a function returning the values |
| txFilterBy: value, fields, matchMode? | Items where any field matches the value by a match mode (`contains` by default) or your own function |

## Functions
| Name | Description |
|---|---|
| filterBySearch(items, query, fields, locale?) | The function behind `txSearch` |
| filterBy(items, value, fields, matchMode?, locale?) | The function behind `txFilterBy`. Match modes: `startsWith`, `contains`, `notContains`, `endsWith`, `equals`, `notEquals`, `in`, `lt`, `lte`, `gt`, `gte`, `between`, `dateIs`, `dateIsNot`, `dateBefore`, `dateAfter`, or `(value, filter, locale) => boolean` |
| matches(value, filter, matchMode?, locale?) | One value against one filter |
| normalizeSearch(value, locale?) | Lower case without accents and outer spaces — compare your own strings the same way |
| resolveField(item, path) | A nested value by a dotted path |
