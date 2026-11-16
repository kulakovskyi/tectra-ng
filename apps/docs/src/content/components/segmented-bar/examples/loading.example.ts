import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'segmented-bar-loading-example',
  imports: [TxSegmentedBar, TxButton],
  template: `
    <div class="wrap">
      <button txButton label="Reload" variant="outlined" (click)="reload()"></button>
      <tx-segmented-bar [items]="tickets" [loading]="loading()" ariaLabel="Tickets by status" />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      justify-items: start;
      gap: 12px;
      max-width: 520px;
    }
    tx-segmented-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarLoadingExample {
  readonly loading = signal(false);
  readonly tickets: TxSegmentedBarItem[] = [
    { key: 'open', label: 'Open', value: 18, tone: 'info' },
    { key: 'waiting', label: 'Waiting', value: 7, tone: 'warn' },
    { key: 'solved', label: 'Solved', value: 52, tone: 'success' },
  ];

  reload(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 900);
  }
}
