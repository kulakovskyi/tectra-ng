import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra/ui/paginator';

@Component({
  selector: 'paginator-pass-through-example',
  imports: [TxPaginator],
  template: `<tx-paginator [(first)]="first" [rows]="10" [totalRecords]="120" [pt]="pt" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorPassThroughExample {
  readonly first = signal(0);
  readonly pt = {
    bar: { style: { border: '1px solid var(--tx-surface-border)' } },
    page: { style: { fontWeight: 'var(--tx-font-weight-semibold)' } },
  };
}
