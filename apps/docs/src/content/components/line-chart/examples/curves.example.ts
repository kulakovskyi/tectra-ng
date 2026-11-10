import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart, TxLineChartCurve } from '@tectra-ng/charts/line';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'line-chart-curves-example',
  imports: [TxLineChart, TxSelect, FormsModule],
  template: `
    <div class="wrap">
      <tx-select class="control" ariaLabel="Curve" [options]="curves" [(ngModel)]="curve" />
      <tx-line-chart
        [series]="series"
        [categories]="hours"
        [curve]="curve()"
        [height]="300"
        ariaLabel="Active users by hour"
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
export default class LineChartCurvesExample {
  readonly curve = signal<TxLineChartCurve>('smooth');
  readonly curves = [
    { label: 'Smooth', value: 'smooth' },
    { label: 'Straight', value: 'straight' },
    { label: 'Step', value: 'step' },
  ];
  readonly hours = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
  readonly series: TxChartSeries[] = [
    { name: 'Active users', data: [120, 64, 90, 410, 520, 480, 610, 330] },
  ];
}
