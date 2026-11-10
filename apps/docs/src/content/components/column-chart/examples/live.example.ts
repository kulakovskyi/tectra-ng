import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxColumnChart } from '@tectra-ng/charts/column';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'column-chart-live-example',
  imports: [TxColumnChart, TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
        <tx-toggle-switch label="Stacked" [(ngModel)]="stacked" />
        <tx-toggle-switch label="Horizontal" [(ngModel)]="horizontal" />
      </div>
      <tx-column-chart
        [series]="series()"
        [categories]="stores"
        [stacked]="stacked()"
        [horizontal]="horizontal()"
        [height]="300"
        ariaLabel="Units sold by store"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ColumnChartLiveExample {
  readonly stores = ['Downtown', 'Airport', 'Harbor', 'Mall'];
  readonly stacked = signal(true);
  readonly horizontal = signal(false);
  private step = 0;
  readonly series = signal<TxChartSeries[]>(this.build(0));

  shuffle(): void {
    this.step += 1;
    this.series.set(this.build(this.step));
  }

  private build(step: number): TxChartSeries[] {
    const wave = (offset: number) =>
      this.stores.map((_, index) => 20 + ((index * 17 + step * 29 + offset) % 45));
    return [
      { name: 'Coffee', data: wave(0) },
      { name: 'Pastry', data: wave(13) },
    ];
  }
}
