import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTree, TxTreeNode, TxTreeNodeDropEvent } from '@tectra-ng/ui/tree';

@Component({
  selector: 'tree-drag-drop-example',
  imports: [TxTree],
  template: `
    <div class="grid">
      <div class="stack">
        <strong>Inbox</strong>
        <tx-tree
          ariaLabel="Inbox"
          draggableNodes
          droppableNodes
          draggableScope="mail"
          droppableScope="mail"
          [(value)]="inbox"
          [expandedKeys]="['today']"
          (nodeDrop)="
            last.set(
              $event.dragNode.label +
                ' → ' +
                $event.position +
                ' ' +
                ($event.dropNode?.label ?? 'root')
            )
          "
        />
      </div>
      <div class="stack">
        <strong>Archive</strong>
        <tx-tree
          ariaLabel="Archive"
          draggableNodes
          droppableNodes
          validateDrop
          draggableScope="mail"
          droppableScope="mail"
          [(value)]="archive"
          (nodeDrop)="confirmDrop($event)"
        />
      </div>
    </div>
    <p class="hint">Last move: {{ last() }}</p>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 24px;
    }
    .stack {
      display: grid;
      gap: 8px;
      align-content: start;
    }
    .hint {
      color: var(--tx-text-muted);
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeDragDropExample {
  readonly last = signal('—');
  readonly inbox = signal<TxTreeNode[]>([
    {
      key: 'today',
      label: 'Today',
      icon: 'inbox',
      children: [
        { key: 'm1', label: 'Weekly report', icon: 'envelope' },
        { key: 'm2', label: 'Team lunch', icon: 'envelope' },
        { key: 'm3', label: 'Invoice 1043', icon: 'envelope' },
      ],
    },
    { key: 'later', label: 'Later', icon: 'clock', children: [] },
  ]);
  readonly archive = signal<TxTreeNode[]>([
    { key: 'old', label: 'Old threads', icon: 'folder', children: [] },
  ]);

  confirmDrop(event: TxTreeNodeDropEvent): void {
    this.last.set(`${event.dragNode.label} archived`);
    event.accept();
  }
}
