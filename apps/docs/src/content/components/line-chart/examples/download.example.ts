import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';

@Component({
  selector: 'line-chart-download-example',
  imports: [TxLineChart, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <tx-toggle-switch label="Chart menu" [(ngModel)]="toolbar" />
      <tx-line-chart
        [series]="series"
        [categories]="weeks"
        [height]="300"
        [toolbar]="toolbar()"
        ariaLabel="Weekly orders"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartDownloadExample {
  readonly toolbar = signal(true);
  readonly weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  readonly series: TxChartSeries[] = [
    { name: 'Orders', data: [320, 410, 380, 460, 520, 490, 580, 640] },
    { name: 'Returns', data: [24, 31, 28, 30, 36, 33, 40, 38] },
  ];
}
