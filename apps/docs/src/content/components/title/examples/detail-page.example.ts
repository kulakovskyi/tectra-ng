import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { TxButton } from '@tectra-ng/ui/button';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTitle, provideTxTitle } from '@tectra-ng/utils/title';

const TITLES: Record<string, string> = { orders: 'Orders' };

@Component({
  selector: 'title-detail-page-example',
  imports: [FormsModule, TxButton, TxSelect],
  providers: [provideTxTitle({ appName: 'tectra', translate: (key) => TITLES[key] ?? key })],
  template: `
    <div class="stack">
      <tx-select
        ariaLabel="Order"
        placeholder="Open an order"
        [options]="orders"
        [(ngModel)]="order"
        (ngModelChange)="open($event)"
      />
      <div class="flex">
        <button txButton label="Back to the list" severity="secondary" (click)="list()"></button>
      </div>
      <span class="hint">Tab title: {{ current() }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TitleDetailPageExample {
  private readonly txTitle = inject(TxTitle);
  private readonly title = inject(Title);

  readonly orders = ['Order 1042', 'Order 1043', 'Order 1044'];
  readonly order = signal<string | null>(null);
  readonly current = signal('');

  open(order: string | null): void {
    this.txTitle.setPage(order ?? undefined, { translate: false });
    this.current.set(this.title.getTitle());
  }

  list(): void {
    this.order.set(null);
    this.txTitle.setPage('orders');
    this.current.set(this.title.getTitle());
  }
}
