import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPageState, TxPaginator } from '@tectra/ui/paginator';

@Component({
  selector: 'paginator-basic-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator
      [(first)]="first"
      [rows]="10"
      [totalRecords]="120"
      (pageChange)="state.set($event)"
    />
    <p class="status">
      Page {{ state().page + 1 }} of {{ state().pageCount }}, records from {{ first() + 1 }}
    </p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      text-align: center;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorBasicExample {
  readonly first = signal(0);
  readonly state = signal<TxPageState>({ page: 0, first: 0, rows: 10, pageCount: 12 });
}
