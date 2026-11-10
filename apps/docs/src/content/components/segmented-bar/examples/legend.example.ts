import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSegmentedBar, TxSegmentedBarItem } from '@tectra-ng/charts/segmented-bar';
import { TxToggleSwitch } from '@tectra-ng/ui/toggle-switch';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'segmented-bar-legend-example',
  imports: [TxSegmentedBar, TxToggleSwitch, FormsModule],
  template: `
    <div class="wrap">
      <div class="controls">
        <tx-toggle-switch label="Legend" [(ngModel)]="legend" />
        <tx-toggle-switch label="Values" [(ngModel)]="value" />
        <tx-toggle-switch label="Percent" [(ngModel)]="percent" />
        <tx-toggle-switch label="Hide empty" [(ngModel)]="hideEmpty" />
      </div>
      <tx-segmented-bar
        [items]="responses"
        [showLegend]="legend()"
        [showValue]="value()"
        [showPercent]="percent()"
        [hideEmptyInLegend]="hideEmpty()"
        monoLabels
        ariaLabel="Responses by status code"
      />
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 16px;
      max-width: 560px;
    }
    .controls {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SegmentedBarLegendExample {
  readonly legend = signal(true);
  readonly value = signal(true);
  readonly percent = signal(true);
  readonly hideEmpty = signal(false);
  readonly responses: TxSegmentedBarItem[] = [
    { key: '2xx', label: '2xx', value: 18420, tone: 'success' },
    { key: '3xx', label: '3xx', value: 2210, tone: 'info' },
    { key: '4xx', label: '4xx', value: 640, tone: 'warn' },
    { key: '5xx', label: '5xx', value: 0, tone: 'danger' },
  ];
}
