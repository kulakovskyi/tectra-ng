import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxPaginationParams,
  firstToPage,
  pageCountOf,
  pageToFirst,
} from '@tectra-ng/utils/pagination';

const TOTAL = 87;
const ROWS = 20;

@Component({
  selector: 'pagination-basic-example',
  imports: [TxButton],
  template: `
    <div class="stack">
      <div class="flex">
        <button
          txButton
          label="Previous"
          severity="secondary"
          [disabled]="page() === 0"
          (click)="go(page() - 1)"
        ></button>
        <button
          txButton
          label="Next"
          severity="secondary"
          [disabled]="page() === pageCount() - 1"
          (click)="go(page() + 1)"
        ></button>
        <span class="hint" aria-live="polite">
          Rows {{ first() + 1 }}–{{ last() }} of {{ total }} · page {{ page() + 1 }} of
          {{ pageCount() }}
        </span>
      </div>
      <code>GET /invoices?page={{ params().page }}&amp;limit={{ params().limit }}</code>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginationBasicExample {
  readonly total = TOTAL;
  readonly first = signal(0);
  readonly page = computed(() => firstToPage(this.first(), ROWS));
  readonly pageCount = computed(() => pageCountOf(TOTAL, ROWS));
  readonly last = computed(() => Math.min(this.first() + ROWS, TOTAL));
  readonly params = computed<TxPaginationParams>(() => ({ page: this.page() + 1, limit: ROWS }));

  go(page: number): void {
    this.first.set(pageToFirst(page, ROWS));
  }
}
