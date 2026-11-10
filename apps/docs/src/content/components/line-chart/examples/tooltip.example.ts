import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxChartSeries,
  TxChartTooltipFormatter,
  TxChartTooltipTemplate,
} from '@tectra-ng/charts/core';
import { TxLineChart } from '@tectra-ng/charts/line';

@Component({
  selector: 'line-chart-tooltip-example',
  imports: [TxLineChart, TxChartTooltipTemplate],
  template: `
    <div class="wrap">
      <tx-line-chart
        [series]="series"
        [categories]="months"
        tooltipMode="single"
        [tooltipFormatter]="money"
        [height]="280"
        ariaLabel="Average order value"
      />
      <tx-line-chart
        [series]="series"
        [categories]="months"
        [height]="280"
        ariaLabel="Average order value with a custom tooltip"
      >
        <ng-template txChartTooltip let-data>
          <div class="tip">
            <strong>{{ data.title }}</strong>
            @for (row of data.rows; track row.seriesIndex) {
              <div class="tip-row">
                <span class="dot" [style.background]="row.color"></span>
                {{ row.label }} — {{ row.value }} orders
              </div>
            }
          </div>
        </ng-template>
      </tx-line-chart>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 24px;
      width: 100%;
    }
    .tip {
      display: grid;
      gap: 4px;
    }
    .tip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LineChartTooltipExample {
  readonly months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
  readonly series: TxChartSeries[] = [
    { name: 'Web', data: [42, 44, 41, 47, 52, 55, 58] },
    { name: 'App', data: [36, 39, 43, 45, 44, 49, 53] },
  ];
  readonly money: TxChartTooltipFormatter = (value) => `$${value.toFixed(2)}`;
}
