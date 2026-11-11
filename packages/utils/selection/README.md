# Selection

Checked rows of a list or a table by key, in a signal: one, a filtered part or all, with the state of a header checkbox (all, some, none). Keys survive paging and filtering, so a selection made on one page stays when the user goes to the next.

```ts
readonly selection = new TxSelection<Order>((order) => order.id);
```

```html
<tx-checkbox [binary]="true" [ngModel]="selection.areAllSelected(page())" [indeterminate]="selection.isPartial(page())" (ngModelChange)="selection.toggleAll(page(), $event)" />
```

## Methods
| Name | Description |
|---|---|
| selectedIds / count | Signals of the selected keys and their number |
| toggleOne(idOrItem, checked?) | Checks or unchecks one; flips it without `checked` |
| toggleAll(items, checked?) | All of these items; flips them as a group without `checked` |
| select(predicate, items, checked) | Every item that passes the predicate |
| isSelected(idOrItem) | One item is checked |
| areAllSelected(items) / areAllSelectedWithPredicate(items, predicate) | Every item (that passes the predicate) is checked; `false` for an empty list |
| isPartial(items) | Some but not all — the indeterminate header checkbox |
| selectedItems(items) | The checked items among these |
| setSelected(ids) / clear() | Replaces or empties the selection |
