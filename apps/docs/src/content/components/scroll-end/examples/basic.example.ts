import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxProgressSpinner } from '@tectra-ng/ui/progress-spinner';
import { TxScrollEnd } from '@tectra-ng/utils/scroll-end';

@Component({
  selector: 'scroll-end-basic-example',
  imports: [TxProgressSpinner, TxScrollEnd],
  template: `
    <div class="stack wide">
      <div
        class="list"
        tabindex="0"
        aria-label="Events"
        txScrollEnd
        [currentCount]="rows().length"
        [maxLimit]="total"
        [disabled]="loading()"
        (scrolledToBottom)="loadMore()"
      >
        @for (row of rows(); track row) {
          <div class="row">Event #{{ row }}</div>
        }
        @if (loading()) {
          <div class="row loader"><tx-progress-spinner size="small" ariaLabel="Loading" /></div>
        }
      </div>
      <span class="hint">{{ rows().length }} of {{ total }} loaded</span>
    </div>
  `,
  styles: `
    .wide {
      max-width: 360px;
    }
    .list {
      height: 220px;
      overflow: auto;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .row {
      padding: 10px 12px;
      border-bottom: 1px solid var(--tx-surface-border);
    }
    .row:last-child {
      border-bottom: 0;
    }
    .loader {
      display: flex;
      justify-content: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollEndBasicExample {
  readonly total = 50;
  readonly rows = signal(Array.from({ length: 10 }, (_, index) => index + 1));
  readonly loading = signal(false);

  loadMore(): void {
    this.loading.set(true);
    setTimeout(() => {
      const start = this.rows().length;
      this.rows.update((rows) => [
        ...rows,
        ...Array.from({ length: 10 }, (_, index) => start + index + 1),
      ]);
      this.loading.set(false);
    }, 500);
  }
}
