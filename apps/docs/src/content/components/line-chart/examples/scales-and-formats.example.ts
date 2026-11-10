import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartSeries, TxChartValueFormat, TxValueScaleKind } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'line-chart-scales-and-formats-example',
  imports: [TxLineChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <tx-select
          class="control"
          ariaLabel="Value format"
          [options]="formats"
          [(ngModel)]="format"
        />
        <tx-select class="control" ariaLabel="Value scale" [options]="scales" [(ngModel)]="scale" />
      </div>
      <tx-line-chart
        [series]="series"
        [categories]="years"
        [valueFormat]="format()"
        [yScale]="scale()"
        [area]="false"
        markers
        [height]="320"
        ariaLabel="Downloads per year"
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
      gap: 12px;
    }
    .control {
      width: 180px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartScalesAndFormatsExample {
  readonly format = signal<TxChartValueFormat>('compact');
  readonly scale = signal<TxValueScaleKind>('linear');
  readonly formats = [
    { label: 'Compact', value: 'compact' },
    { label: 'Number', value: 'number' },
    { label: 'Integer', value: 'integer' },
  ];
  readonly scales = [
    { label: 'Linear scale', value: 'linear' },
    { label: 'Log scale', value: 'log' },
  ];
  readonly years = ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'];
  readonly series: TxChartSeries[] = [
    { name: 'Library', data: [1200, 5400, 31000, 160000, 720000, 2100000, 4800000, 9100000] },
    { name: 'Plugins', data: [300, 900, 4200, 18000, 64000, 230000, 610000, 1500000] },
  ];
}
