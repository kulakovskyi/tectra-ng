# Pinned tabs

Quick-switch tabs for a filter with many values: the user pins the values they use often in a dialog, and those values appear as tabs next to an "All" tab. The choice is saved in `localStorage`. Put it above a list next to the full select of the same filter and bind both to one value.

```html
<tx-pinned-tabs [stateKey]="'teams:' + userId()" [options]="teams()" allLabel="All teams" [(selected)]="selectedTeams" />
```

The server and the first render in the browser show `defaultPinned`; the saved choice is read from `localStorage` right after, in the same frame, so a hydrated page does not mismatch. With nothing pinned only a labelled "Customize" button shows and the host gets `tx-pinned-tabs--empty`; next to tabs it is a square icon with a tooltip. The tabs scroll sideways when they do not fit and the button stays visible — give the host `min-width: 0` inside a flex row.

## Inputs
| Name | Description |
|---|---|
| stateKey | Required. `localStorage` key of the pinned values; add the user id to keep the choice per user. Read again when it changes |
| options | Required. Values that can be pinned (`TxPinnedTabOption[]`: `value`, `label`); the tabs follow this order, a pinned value missing here shows no tab |
| defaultPinned | Values pinned while the user has not saved a choice under `stateKey` yet |
| allLabel | Label of the tab that clears the selection; the translated "All" by default |
| selected | Two-way: the selection of the filter. Empty — the "All" tab is active, one value — its tab, several values — no tab |
| dialogTitle | Title of the settings dialog; the translated "Pinned tabs" by default |
| dialogText | Explanation in the settings dialog; a translated hint by default |
| ariaLabel | Name of the tab list |
| dt | Design tokens of this instance (`pinnedTabs`) |
| pt | Classes and styles of the parts: `root`, `tabs`, `button` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| selectedChange | A tab was picked: `[value]`, or `[]` for "All" |

## Methods
| Name | Description |
|---|---|
| openSettings() | Opens the settings dialog |
| pin(value) | Pins a value from code and saves the choice |
| unpin(value) | Unpins a value from code and saves the choice |
| pinned | Signal: the pinned values |

## Keyboard
| Key | Action |
|---|---|
| Arrow Left / Arrow Right | Move between the tabs |
| Enter / Space | Pick a tab; on the button: open the settings |
| Tab | In the dialog: through the values, Cancel and Save; Space toggles a value |
| Escape | Closes the dialog without saving |
