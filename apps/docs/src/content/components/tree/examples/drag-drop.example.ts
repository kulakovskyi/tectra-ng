import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxToastService } from '@tectra-ng/ui/toast';
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
          (nodeDrop)="moved($event)"
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
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreeDragDropExample {
  private readonly toast = inject(TxToastService);
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

  moved(event: TxTreeNodeDropEvent): void {
    const place = event.position === 'inside' ? 'into' : event.position;
    this.toast.info(
      `${event.dragNode.label} moved ${place} ${event.dropNode?.label ?? 'the list'}`,
    );
  }

  confirmDrop(event: TxTreeNodeDropEvent): void {
    event.accept();
    this.toast.success(`${event.dragNode.label} archived`);
  }
}
