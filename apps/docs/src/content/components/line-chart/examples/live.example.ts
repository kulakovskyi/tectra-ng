import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChartSeries } from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'line-chart-live-example',
  imports: [TxLineChart, TxButton],
  template: `
    <div class="wrap">
      <button
        class="action"
        txButton
        label="New readings"
        variant="outlined"
        (click)="refresh()"
      ></button>
      <tx-line-chart
        [series]="series()"
        [categories]="minutes"
        [height]="280"
        ariaLabel="Requests per minute"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
      width: 100%;
    }
    .action {
      justify-self: start;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartLiveExample {
  readonly minutes = ['-9m', '-8m', '-7m', '-6m', '-5m', '-4m', '-3m', '-2m', '-1m', 'now'];
  private readonly sets = [
    [820, 900, 870, 960, 1010, 980, 1120, 1080, 1150, 1210],
    [640, 720, 1100, 980, 860, 790, 940, 1280, 1190, 1030],
    [1200, 1150, 1020, 990, 940, 1010, 1080, 1130, 1060, 980],
  ];
  private next = 1;
  readonly series = signal<TxChartSeries[]>([{ name: 'Requests', data: this.sets[0] }]);

  refresh(): void {
    this.series.set([{ name: 'Requests', data: this.sets[this.next % this.sets.length] }]);
    this.next += 1;
  }
}
