import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TxScatterChart, TxScatterSeries } from '@tectra-ng/charts/scatter';

@Component({
  selector: 'scatter-chart-tooltip-template-example',
  imports: [TxScatterChart, TxChartTooltipTemplate],
  template: `<tx-scatter-chart
    [series]="series"
    xAxisTitle="Experience, years"
    yAxisTitle="Tasks closed"
    ariaLabel="Experience and closed tasks"
  >
    <ng-template txChartTooltip let-data>
      <div class="tip">
        <strong>{{ data.title }}</strong>
        <span>{{ data.rows[1].value }} years · {{ data.rows[2].value }} tasks</span>
      </div>
    </ng-template>
  </tx-scatter-chart>`,
  styles: `
    tx-scatter-chart {
      width: 100%;
    }
    .tip {
      display: grid;
      gap: 2px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScatterChartTooltipTemplateExample {
  readonly series: TxScatterSeries[] = [
    {
      name: 'Team',
      data: [
        { x: 1, y: 42, label: 'Robin' },
        { x: 3, y: 61, label: 'Sam' },
        { x: 4, y: 58, label: 'Alex' },
        { x: 6, y: 77, label: 'Jordan' },
        { x: 8, y: 70, label: 'Taylor' },
        { x: 11, y: 88, label: 'Casey' },
      ],
    },
  ];
}
