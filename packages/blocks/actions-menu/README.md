# Actions menu

The "more" button of a page header, a panel or a card: an outlined `⋯` button that opens a short list of actions in a popover. A destructive action is red. The menu emits the id of the chosen action after it has closed, so the action can open a dialog or a confirm right away.

```html
<tx-actions-menu tooltip="Team actions" [items]="actions" (itemSelect)="run($event)" />
```

```ts
readonly actions: TxActionsMenuItem[] = [
  { id: 'rename', label: 'Rename', icon: 'pencil' },
  { id: 'delete', label: 'Delete team', icon: 'trash', danger: true },
];
```

Without items nothing is rendered. The button is named by `ariaLabel`, then `tooltip`, then the translated "More actions".

## Inputs
| Name | Description |
|---|---|
| items | Required. Actions (`TxActionsMenuItem[]`: `id`, `label`, optional `icon` and `danger`) |
| tooltip | Tooltip of the button; also its accessible name |
| ariaLabel | Accessible name of the button and the menu when it differs from the tooltip |
| size | `medium` (default) or `small` — a 30px button for card and column headers |
| dt | Design tokens of this instance (`actionsMenu`) |
| pt | Classes and styles of the parts: `root`, `trigger`, `list`, `item`, `icon`, `label` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemSelect | The id of the chosen action, emitted once the menu has closed |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | On the button: opens the menu and focuses the first action. On an action: runs it |
| Down / Up | Next / previous action, wrapping around |
| Home / End | First / last action |
| Escape | Closes the menu, the focus returns to the button |
| Tab | Leaves the menu and closes it |
