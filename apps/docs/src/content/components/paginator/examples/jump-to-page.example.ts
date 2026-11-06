import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';

@Component({
  selector: 'paginator-jump-to-page-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator
      showJumpToPageDropdown
      [showPageLinks]="false"
      [(first)]="first"
      [rows]="10"
      [totalRecords]="400"
    />
    <tx-paginator
      showJumpToPageInput
      [showPageLinks]="false"
      [(first)]="first"
      [rows]="10"
      [totalRecords]="400"
    />
  `,
  styles: `
    :host {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorJumpToPageExample {
  readonly first = signal(0);
}
