import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator, TxRowsPerPageOption } from '@tectra/ui/paginator';

@Component({
  selector: 'paginator-rows-per-page-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator
      [(first)]="first"
      [(rows)]="rows"
      [totalRecords]="240"
      [rowsPerPageOptions]="options"
    />
    <p class="status">{{ rows() }} rows per page, first record {{ first() + 1 }}</p>
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
export default class PaginatorRowsPerPageExample {
  readonly first = signal(0);
  readonly rows = signal(20);
  readonly options: TxRowsPerPageOption[] = [5, 10, 50, 100, { showAll: 'All' }];
}
