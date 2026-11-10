import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartLegendPosition, TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'line-chart-legend-example',
  imports: [TxLineChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select
        class="control"
        ariaLabel="Legend position"
        [options]="positions"
        [(ngModel)]="position"
      />
      <tx-line-chart
        [series]="series"
        [categories]="weeks"
        [legendPosition]="position()"
        legendAlign="center"
        [height]="320"
        ariaLabel="Build minutes by team"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .control {
      width: 180px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLegendExample {
  readonly position = signal<TxChartLegendPosition>('bottom');
  readonly positions = [
    { label: 'Top', value: 'top' },
    { label: 'Bottom', value: 'bottom' },
    { label: 'Left', value: 'left' },
    { label: 'Right', value: 'right' },
  ];
  readonly weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8'];
  readonly series: TxChartSeries[] = [
    { name: 'Web', data: [310, 280, 350, 400, 380, 420, 460, 440] },
    { name: 'Mobile', data: [220, 260, 240, 300, 310, 290, 330, 360] },
    { name: 'Platform', data: [150, 170, 160, 190, 230, 210, 240, 250] },
    { name: 'Data', data: [90, 110, 130, 120, 140, 160, 150, 180] },
  ];
}
