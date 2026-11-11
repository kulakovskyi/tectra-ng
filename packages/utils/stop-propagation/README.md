# Stop Propagation

Keeps a click (or other events) inside an element — a menu button in a clickable card or table row, a link inside an expandable header. Optionally prevents the default action too.

```html
<tx-card (click)="open(project)">
  <button txButton icon="ellipsis-v" aria-label="Actions" txStopPropagation (click)="menu.toggle($event)"></button>
</tx-card>
```

## Inputs
| Name | Description |
|---|---|
| txStopPropagation | Events to stop: `click` by default, or a list (`"click keydown"`) |
| preventDefault | Also prevent the default action |
