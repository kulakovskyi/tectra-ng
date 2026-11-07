import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';

@Component({
  selector: 'scroll-panel-methods-example',
  imports: [TxScrollPanel, TxButton],
  template: `
    <div class="actions">
      <button txButton size="small" severity="secondary" icon="arrow-up" (click)="log.scrollTop(0)">
        Top
      </button>
      <button
        txButton
        size="small"
        severity="secondary"
        icon="arrow-down"
        (click)="log.scrollTop(100000)"
      >
        Bottom
      </button>
    </div>
    <tx-scroll-panel #log class="panel" ariaLabel="Activity log">
      @for (entry of entries; track entry) {
        <p class="entry">{{ entry }}</p>
      }
    </tx-scroll-panel>
  `,
  styles: `
    .actions {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
    }

    .panel {
      height: 180px;
    }

    .entry {
      margin: 0;
      padding: 4px 16px 4px 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollPanelMethodsExample {
  readonly entries = Array.from(
    { length: 30 },
    (_, index) =>
      `${String(9 + Math.floor(index / 6)).padStart(2, '0')}:${String((index % 6) * 10).padStart(2, '0')} — Job ${index + 1} finished`,
  );
}
