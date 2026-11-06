# Stepper

Two step indicators for multi-step flows.

- `tx-stepper` — a stepper with its own panels: a row of numbered steps above the panels (`tx-step-list` + `tx-step-panels`) or vertical items whose panels open under each step (`tx-step-item`). `linear` lets the panels' own buttons move on only.
- `tx-steps` — a step indicator built from an `items` array, without panels: numbers above the labels (`default`) or a compact track of markers with labels and descriptions (`track`) that stacks in a column when it is narrower than 560px.

```html
<tx-stepper [(value)]="step">
  <tx-step-list>
    <tx-step [value]="1">Account</tx-step>
    <tx-step [value]="2">Profile</tx-step>
  </tx-step-list>
  <tx-step-panels>
    <tx-step-panel [value]="1">
      <ng-template txStepPanelContent let-activate>
        …
        <button txButton (click)="activate(2)">Next</button>
      </ng-template>
    </tx-step-panel>
    <tx-step-panel [value]="2">…</tx-step-panel>
  </tx-step-panels>
</tx-stepper>

<tx-steps variant="track" [items]="steps" [(activeIndex)]="current" />
```

## Inputs
| Name | Description |
|---|---|
| value | `tx-stepper`, two-way: the value of the active step. On `tx-step`, `tx-step-panel` and `tx-step-item`: the value of that step (a step and a panel inside a `tx-step-item` take the item's value) |
| linear | `tx-stepper`: steps cannot be picked in the header; only the panels move on through `activate` |
| disabled | `tx-step`: the step cannot be picked |
| items | `tx-steps`: the steps, `TxStepsItem[]` — `label`, `icon`, `description` (track), `disabled`, `command` (runs with `{ originalEvent, item, index }` when the step is clicked) |
| activeIndex | `tx-steps`, two-way: index of the current step; the steps before it are done. Set it to `items.length` to mark every step done |
| readonly | `tx-steps`: the steps cannot be clicked (default `true`). Off, an enabled step with a `command` can be clicked: it becomes current and runs its `command` |
| variant | `tx-steps`: `default` (numbers above the labels) or `track` (markers with labels and descriptions, a check on done steps) |
| ariaLabel | `tx-steps`: accessible name of the list |
| ariaLabelledBy | `tx-steps`: id of the element that names the list |
| dt | Design tokens of this instance (`stepper` on `tx-stepper`, `steps` on `tx-steps`) |
| pt | Classes and styles of the parts. `tx-stepper`: `root`, `list`, `step`, `header`, `number`, `title`, `separator`, `panels`, `panel`, `item`. `tx-steps`: `root`, `list`, `item`, `link`, `number`, `label`, `description`, `line` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| valueChange | `tx-stepper`: another step became active |
| activeIndexChange | `tx-steps`: a step was clicked (only when not `readonly`) |

## Slots
| Name | Description |
|---|---|
| default | `tx-step`: the step title. `tx-step-panel`: content that is always rendered |
| txStepPanelContent | `<ng-template txStepPanelContent let-activate let-value="value" let-index="index" let-active="active">` — panel content, rendered when the step is first opened; `activate(value)` moves to a step |
| txStepContent | `<ng-template txStepContent let-value let-active="active" let-completed="completed" let-index="index" let-activate="activate">` — own step header instead of the number and the title |
| txStepsItem | `<ng-template txStepsItem let-item let-index="index" let-active="active" let-done="done">` — own content of a `tx-steps` step |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves to the active step of a step list, then into the panel; in vertical items every step header is a tab stop |
| Arrow Right / Arrow Down | Next step of a step list (or next clickable step of `tx-steps`), wraps around |
| Arrow Left / Arrow Up | Previous step, wraps around |
| Home / End | First / last step |
| Enter / Space | Opens the focused step |
