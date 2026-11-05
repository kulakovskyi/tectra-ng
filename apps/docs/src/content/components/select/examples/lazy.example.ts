import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelect, TxSelectFilterEvent, TxSelectLazyLoadEvent } from '@tectra/ui/select';

interface Customer {
  label: string;
  value: number;
}

const ALL_CUSTOMERS: Customer[] = Array.from({ length: 2000 }, (_, index) => ({
  label: `Customer ${index + 1}`,
  value: index + 1,
}));

@Component({
  selector: 'select-lazy-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="rows()"
    [lazy]="true"
    [virtualScroll]="true"
    [filter]="true"
    [filterDelay]="300"
    [loading]="searching()"
    [placeholder]="'Customer'"
    (lazyLoad)="load($event)"
    (filtered)="search($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectLazyExample {
  readonly rows = signal<(Customer | undefined)[]>(new Array(ALL_CUSTOMERS.length).fill(undefined));
  readonly searching = signal(false);
  private matches = ALL_CUSTOMERS;

  load(event: TxSelectLazyLoadEvent): void {
    const first = Math.floor(event.first / 50) * 50;
    const last = Math.ceil(event.last / 50) * 50;
    setTimeout(() => {
      this.rows.update((rows) => {
        const next = [...rows];
        this.matches
          .slice(first, last)
          .forEach((customer, offset) => (next[first + offset] = customer));
        return next;
      });
    }, 400);
  }

  search(event: TxSelectFilterEvent): void {
    this.searching.set(true);
    setTimeout(() => {
      const query = event.query.trim().toLowerCase();
      this.matches = ALL_CUSTOMERS.filter((customer) =>
        customer.label.toLowerCase().includes(query),
      );
      this.rows.set(new Array(this.matches.length).fill(undefined));
      this.searching.set(false);
    }, 300);
  }
}
