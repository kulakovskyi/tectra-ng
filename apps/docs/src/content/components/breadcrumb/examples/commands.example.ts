import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxBreadcrumb, TxBreadcrumbItem, TxBreadcrumbItemEvent } from '@tectra-ng/ui/breadcrumb';
import { TxButton } from '@tectra-ng/ui/button';

const FOLDERS = ['Documents', 'Reports', '2026', 'November'];

@Component({
  selector: 'breadcrumb-commands-example',
  imports: [TxBreadcrumb, TxButton],
  template: `
    <tx-breadcrumb [model]="items()" (itemClick)="last.set($event.item.label ?? '')" />
    <div class="row">
      <button
        txButton
        size="small"
        severity="secondary"
        [disabled]="depth() === folders.length"
        (click)="open()"
      >
        Open next folder
      </button>
      <span class="status">Last click: {{ last() || 'none' }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }
    .status {
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BreadcrumbCommandsExample {
  readonly folders = FOLDERS;
  readonly depth = signal(3);
  readonly last = signal('');
  readonly items = computed<TxBreadcrumbItem[]>(() =>
    this.folders.slice(0, this.depth()).map((label, index) => ({
      label,
      icon: index === 0 ? 'folder' : undefined,
      command: (event: TxBreadcrumbItemEvent) => this.goTo(index, event),
    })),
  );

  open(): void {
    this.depth.update((depth) => Math.min(depth + 1, this.folders.length));
  }

  private goTo(index: number, event: TxBreadcrumbItemEvent): void {
    event.originalEvent.preventDefault();
    this.depth.set(index + 1);
  }
}
