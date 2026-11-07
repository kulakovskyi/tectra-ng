# Splitter

Two or more panels side by side or stacked, with a gutter between them that the user drags (or moves with the keyboard) to share the space. Sizes are percentages; panels can have a minimum and a maximum, snap shut when collapsible, nest, and keep their sizes in the browser storage.

```html
<tx-splitter stateKey="editor-layout" (resizeEnd)="save($event.sizes)">
  <tx-splitter-panel [size]="25" [minSize]="15" collapsible>Files</tx-splitter-panel>
  <tx-splitter-panel [size]="75">
    <tx-splitter layout="vertical">
      <tx-splitter-panel>Editor</tx-splitter-panel>
      <tx-splitter-panel [size]="30">Terminal</tx-splitter-panel>
    </tx-splitter>
  </tx-splitter-panel>
</tx-splitter>
```

## Inputs
| Name | Description |
|---|---|
| layout | `horizontal` (panels side by side) or `vertical` (stacked) |
| panelSizes | Sizes of the panels in percent; win over the panels' own `size` |
| minSizes | Minimum sizes in percent for panels without their own `minSize` |
| gutterSize | Thickness of the gutter in pixels |
| step | Pixels an arrow key moves the gutter |
| disabled | The gutters cannot be moved |
| stateKey | Storage key; the sizes are saved after every resize and restored on the next visit |
| stateStorage | `session` or `local` storage for `stateKey` |
| gutterAriaLabel | Accessible name of the gutters (translated "Resize panels" by default) |
| size | `tx-splitter-panel`: initial size in percent (the panels share the space evenly without it) |
| minSize | `tx-splitter-panel`: smallest size in percent |
| maxSize | `tx-splitter-panel`: largest size in percent |
| collapsible | `tx-splitter-panel`: a drag below `minSize` snaps the panel shut, a drag back opens it at `minSize` |
| collapsedSize | `tx-splitter-panel`: size of the panel while shut |
| dt | Design tokens of this instance (`splitter`) |
| pt | Classes and styles of the parts: `root`, `panel`, `gutter`, `handle` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

`sizes()` and `collapsed()` read the current state; `resetState()` goes back to the stored or initial sizes.

## Outputs
| Name | Description |
|---|---|
| resizeStart | A drag or a key press started a resize: `{ originalEvent, sizes }` |
| resizing | The sizes changed during the resize: `{ originalEvent, sizes }` |
| resizeEnd | The pointer or the key was released: `{ originalEvent, sizes }` |
| collapsedChange | A collapsible panel snapped shut or opened: `{ index, collapsed, sizes }` |

## Slots
| Name | Description |
|---|---|
| tx-splitter-panel | One panel; its content can be another `tx-splitter` |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves focus to the next gutter |
| Left / Right arrow | Moves the gutter of a horizontal splitter by `step` pixels |
| Up / Down arrow | Moves the gutter of a vertical splitter by `step` pixels |
| Home | Shrinks the panel before the gutter to its minimum (shut when collapsible) |
| End | Grows the panel before the gutter as far as the others allow |
| Enter | Collapses or restores the collapsible panel next to the gutter |
