# Fieldset

Groups related fields under a legend — a native `<fieldset>`, so screen readers announce the legend with every field inside. It can collapse.

```html
<tx-fieldset legend="Billing address" [toggleable]="true">
  …fields…
</tx-fieldset>
```

## Inputs
| Name | Description |
|---|---|
| legend | Text of the legend |
| toggleable | Turns the legend into a button that collapses the content |
| collapsed | Two-way: the content is collapsed |
| dt | Design tokens of this instance (`fieldset`) |
| pt | Classes and styles of the parts: `root`, `legend`, `toggle`, `content` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| collapsedChange | The content was collapsed or expanded |

## Slots
| Name | Description |
|---|---|
| default | The fields |
| txFieldsetLegend | Own legend content, e.g. an icon with text |

## Keyboard
| Key | Action |
|---|---|
| Enter / Space | Collapses or expands from the legend button |
