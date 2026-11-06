# Tabs

Switch between views, modes or filters. Three looks: `segmented` (equal items in a track, the default), `pills` (content-width items) and `line` (an underline under the active tab). Pass an array of tabs, or build the list and the panels from parts.

```html
<tx-tabs [tabs]="tabs" [(value)]="active" (tabChange)="load($event)" />

<tx-tabs variant="line" [(value)]="active">
  <tx-tab-list ariaLabel="Project">
    <tx-tab value="summary">Summary</tx-tab>
    <tx-tab value="members" [badge]="4">Members</tx-tab>
  </tx-tab-list>
  <tx-tab-panels>
    <tx-tab-panel value="summary">…</tx-tab-panel>
    <tx-tab-panel value="members">
      <ng-template txTabPanelContent>…</ng-template>
    </tx-tab-panel>
  </tx-tab-panels>
</tx-tabs>
```

`TxTabItem`: `value`, `label`, `icon`, `tooltip`, `description` (hint under the control while the tab is active), `badge` (counter after the label, `0` is shown), `disabled`.

## Inputs
| Name | Description |
|---|---|
| value | Two-way: the value of the active tab |
| tabs | Tabs as an array of `TxTabItem`; the list is rendered for you |
| variant | `segmented`, `pills` or `line` |
| size | `small` or `medium` (segmented) |
| orientation | `horizontal` or `vertical` (full-width tabs in a column) |
| raised | Card background, ring and shadow — for tabs on the page background |
| scrollable | Previous / next buttons when the tabs do not fit |
| showNavigators | Shows the previous / next buttons of a scrollable list |
| lazy | Renders only the active panel |
| selectOnFocus | The arrow keys pick the tab at once |
| ariaLabel | Accessible name of the tab list — on `tx-tabs` with `tabs`, or on `tx-tab-list` |
| ariaLabelledBy | Id of the element that names the tab list — on `tx-tabs` with `tabs`, or on `tx-tab-list` |
| icon | `tx-tab`: icon before the label |
| badge | `tx-tab`: counter after the label |
| description | `tx-tab`: hint under the control while the tab is active |
| disabled | `tx-tab`: the tab cannot be picked |
| dt | Design tokens of this instance (`tabs`) |
| pt | Classes and styles of the parts: `root`, `list`, `track`, `content`, `tab`, `icon`, `label`, `badge`, `activeBar`, `previousButton`, `nextButton`, `description`, `panels`, `panel` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`tx-tab` and `tx-tab-panel` take a required `value`. A tab can also be a link: `a[txTab]` (with `routerLink`) or `button[txTab]`.

## Outputs
| Name | Description |
|---|---|
| valueChange | The active tab changed |
| tabChange | The user picked another tab; emits its value |

## Slots
| Name | Description |
|---|---|
| tx-tab-list | The list of `tx-tab` |
| tx-tab-panels | The panels, one `tx-tab-panel` per value |
| txTabPanelContent | `<ng-template txTabPanelContent>` in a panel — created on the first visit (only while active with `lazy`) |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus to the active tab, then into the panel |
| Right / Left arrow | Next / previous tab (Down / Up when vertical); disabled tabs are skipped |
| Home / End | First / last tab |
| Enter / Space | Picks the focused tab |
