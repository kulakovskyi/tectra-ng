import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';

@Component({
  selector: 'paginator-compact-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator [(first)]="first" [rows]="10" [totalRecords]="500" />
    <tx-paginator compactBreakpoint="100rem" [(first)]="first" [rows]="10" [totalRecords]="500" />
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorCompactExample {
  readonly first = signal(50);
}
