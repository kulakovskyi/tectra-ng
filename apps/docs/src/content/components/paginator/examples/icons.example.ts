import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra/ui/paginator';

@Component({
  selector: 'paginator-icons-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator
      firstPageIcon="step-backward"
      previousPageIcon="chevron-left"
      nextPageIcon="chevron-right"
      lastPageIcon="step-forward"
      [(first)]="first"
      [rows]="10"
      [totalRecords]="120"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorIconsExample {
  readonly first = signal(0);
}
