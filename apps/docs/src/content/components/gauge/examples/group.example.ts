import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGauge, TxGaugeBand } from '@tectra-ng/charts/gauge';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'gauge-group-example',
  imports: [TxGauge, TxCard],
  template: `
    <div class="row">
      @for (metric of metrics; track metric.label) {
        <tx-card>
          <tx-gauge
            [value]="metric.value"
            [bands]="bands"
            [label]="metric.label"
            [height]="170"
            [showTicks]="false"
          />
        </tx-card>
      }
    </div>
  `,
  styles: `
    .row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GaugeGroupExample {
  readonly bands: TxGaugeBand[] = [
    { from: 0, to: 60, tone: 'danger', label: 'Poor' },
    { from: 60, to: 85, tone: 'warn', label: 'Fair' },
    { from: 85, to: 100, tone: 'success', label: 'Good' },
  ];
  readonly metrics = [
    { label: 'Performance', value: 78 },
    { label: 'Accessibility', value: 96 },
    { label: 'Best practices', value: 54 },
  ];
}
