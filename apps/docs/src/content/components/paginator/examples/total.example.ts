import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';

@Component({
  selector: 'paginator-total-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator
      showTotal
      [(first)]="first"
      [(rows)]="rows"
      [totalRecords]="1284"
      [rowsPerPageOptions]="[5, 10, 50, 100]"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorTotalExample {
  readonly first = signal(0);
  readonly rows = signal(10);
}
