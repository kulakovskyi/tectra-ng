import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPageState, TxPaginationParams, TxPaginator, firstToPage } from '@tectra/ui/paginator';

interface Invoice {
  id: number;
  title: string;
}

const TOTAL = 87;

@Component({
  selector: 'paginator-server-example',
  imports: [TxPaginator],
  template: `
    <ul class="list" [attr.aria-busy]="loading()">
      @for (invoice of invoices(); track invoice.id) {
        <li>{{ invoice.title }}</li>
      }
    </ul>
    <tx-paginator
      showTotal
      [first]="(params().page - 1) * params().limit!"
      [rows]="params().limit!"
      [totalRecords]="total()"
      [rowsPerPageOptions]="[5, 10, 50, 100]"
      (pageChange)="load($event)"
    />
  `,
  styles: `
    .list {
      display: grid;
      gap: 4px;
      min-height: 160px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
    }
    .list[aria-busy='true'] {
      opacity: 0.5;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorServerExample {
  readonly params = signal<TxPaginationParams>({ page: 1, limit: 5 });
  readonly invoices = signal<Invoice[]>(this.fetch({ page: 1, limit: 5 }));
  readonly total = signal(TOTAL);
  readonly loading = signal(false);

  load({ first, rows }: TxPageState): void {
    const params = { page: firstToPage(first, rows) + 1, limit: rows };
    this.params.set(params);
    this.loading.set(true);
    setTimeout(() => {
      this.invoices.set(this.fetch(params));
      this.loading.set(false);
    }, 400);
  }

  private fetch({ page, limit = 5 }: TxPaginationParams): Invoice[] {
    const start = (page - 1) * limit;
    return Array.from({ length: Math.max(0, Math.min(limit, TOTAL - start)) }, (_, index) => ({
      id: start + index + 1,
      title: `Invoice #${String(start + index + 1).padStart(4, '0')}`,
    }));
  }
}
