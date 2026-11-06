import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPaginator } from '@tectra-ng/ui/paginator';

@Component({
  selector: 'paginator-current-page-report-example',
  imports: [TxPaginator],
  template: `
    <tx-paginator showCurrentPageReport [(first)]="first" [rows]="10" [totalRecords]="120" />
    <tx-paginator
      showCurrentPageReport
      currentPageReportTemplate="{first}–{last} of {totalRecords}"
      [showPageLinks]="false"
      [(first)]="first"
      [rows]="10"
      [totalRecords]="120"
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
export default class PaginatorCurrentPageReportExample {
  readonly first = signal(0);
}
