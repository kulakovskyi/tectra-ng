import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';
import { TxButton } from '@tectra-ng/ui/button';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'combo-chart-live-example',
  imports: [TxComboChart, TxButton, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <button txButton label="Shuffle" variant="outlined" (click)="shuffle()"></button>
        <tx-toggle-switch label="Stacked" [(ngModel)]="stacked" />
        <tx-toggle-switch label="Area" [(ngModel)]="area" />
      </div>
      <tx-combo-chart
        [series]="series()"
        [categories]="stores"
        [stacked]="stacked()"
        [height]="300"
        ariaLabel="Units sold and average basket by store"
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
export default class ComboChartLiveExample {
  readonly stores = ['Downtown', 'Airport', 'Harbor', 'Mall', 'Station'];
  readonly stacked = signal(false);
  readonly area = signal(false);
  private readonly step = signal(0);

  readonly series = computed(() => this.build(this.step(), this.area()));

  shuffle(): void {
    this.step.update((step) => step + 1);
  }

  private build(step: number, area: boolean): TxComboChartSeries[] {
    const wave = (offset: number, base: number, span: number) =>
      this.stores.map((_, index) => base + ((index * 17 + step * 29 + offset) % span));
    return [
      { name: 'Coffee', data: wave(0, 20, 45) },
      { name: 'Pastry', data: wave(13, 10, 30) },
      { name: 'Basket', data: wave(7, 6, 9), type: area ? 'area' : 'line', axis: 'secondary' },
    ];
  }
}
