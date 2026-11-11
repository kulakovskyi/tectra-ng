import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxComboChart, TxComboChartSeries } from '@tectra-ng/charts/combo';

@Component({
  selector: 'combo-chart-axes-example',
  imports: [TxComboChart],
  template: `<tx-combo-chart
    [series]="series"
    [categories]="cities"
    xAxisTitle="City"
    yAxisTitle="Rainfall, mm"
    y2AxisTitle="Temperature, °C"
    yAxisPosition="right"
    [y2Min]="-10"
    [y2Max]="30"
    [height]="380"
    ariaLabel="Rainfall and temperature by city"
  />`,
  styles: `
    tx-combo-chart {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ComboChartAxesExample {
  readonly cities = ['Lisbon', 'Oslo', 'Vienna', 'Warsaw', 'Madrid', 'Dublin', 'Athens'];
  readonly series: TxComboChartSeries[] = [
    { name: 'Rainfall', data: [82, 64, 51, 38, 33, 71, 47] },
    {
      name: 'Temperature',
      data: [17.2, 6.3, 11.4, 8.5, 15.0, 9.8, 19.1],
      type: 'line',
      axis: 'secondary',
    },
  ];
}
