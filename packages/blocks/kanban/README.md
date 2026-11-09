# Kanban

A board of columns with cards. Cards move inside a column and between columns, whole columns move by their handle — with the pointer or with Alt and the arrow keys. The board only reports the move; the page updates its own state and calls its API.

```html
<tx-kanban [columns]="columns()" [itemId]="taskId" itemsDraggable (itemDropped)="moveTask($event)">
  <ng-template txKanbanCard let-task>
    <task-card [task]="task" />
  </ng-template>
</tx-kanban>
```

`itemDropped` gives `{ itemId, fromColumnId, toColumnId, beforeId, afterId }` — the neighbours among the shown cards of the target column (`null` at the edges); `columnDropped` gives `{ columnId, beforeId, afterId }`. Long columns show `pageSize` cards and a full-width "Show N more" button; it scrolls to the first new card and moves the focus there. With `height` every column scrolls inside; without it the page scrolls. The board scrolls sideways when dragged by its background.

## Inputs
| Name | Description |
|---|---|
| columns | Required. Columns to show (`TxKanbanColumn<T>[]`: `id`, `title`, `items`) |
| itemId | Required. `(item) => string` — the card id, used for tracking and in the events |
| itemsDraggable | Cards move inside and between columns |
| columnsDraggable | Columns move; a handle shows in every header |
| focusableCards | The card wrappers take the focus for the keyboard moves (default on). Turn it off when the card template is focusable itself — Alt and the arrows then work from inside the card |
| columnWidth | Width of every column (`252px` by default, the `column.width` token) |
| label | Name of the board; the translated "Board" by default |
| emptyText | Text of an empty column without a `txKanbanEmpty` template; translated by default |
| columnDragLabel | Name of the column handle; translated by default |
| pageSize | Cards per column before "Show N more"; `0` shows all (default 30) |
| height | Height of the board, e.g. `70vh`; the columns then scroll inside |
| dt | Design tokens of this instance (`kanban`) |
| pt | Classes and styles of the parts: `root`, `column`, `header`, `list`, `card`, `empty` |
| ptOptions | How `pt` merges with the global pass-through |
| unstyled | Removes the tectra styles |

## Outputs
| Name | Description |
|---|---|
| itemDropped | A card moved: `{ itemId, fromColumnId, toColumnId, beforeId, afterId }` |
| columnDropped | A column moved: `{ columnId, beforeId, afterId }` |

## Slots
| Name | Description |
|---|---|
| txKanbanCard | Required. `<ng-template txKanbanCard let-item let-column="column">` — the card |
| txKanbanColumnHeader | `<ng-template txKanbanColumnHeader let-column>` — own header instead of the title and the count |
| txKanbanColumnTop | `<ng-template txKanbanColumnTop let-column>` — under the header, e.g. a quick-add field |
| txKanbanColumnFooter | `<ng-template txKanbanColumnFooter let-column>` — at the bottom of a column |
| txKanbanEmpty | `<ng-template txKanbanEmpty let-column>` — content of an empty column |
| default | After the last column, e.g. an "Add column" button |

## Keyboard
| Key | Action |
|---|---|
| Tab | Moves through the cards (when `itemsDraggable`) and the column handles |
| Alt + Arrow Up / Arrow Down | On a card: moves it up or down in its column |
| Alt + Arrow Left / Arrow Right | On a card: moves it to the column before or after; on a handle: moves the column |
