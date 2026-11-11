import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSunburstChart, TxSunburstEvent, TxSunburstItem } from '@tectra-ng/charts/sunburst';

@Component({
  selector: 'sunburst-chart-events-example',
  imports: [TxSunburstChart],
  template: `
    <div class="wrap">
      <tx-sunburst-chart
        [data]="data"
        [height]="300"
        ariaLabel="Sales by region"
        (segmentClick)="onSegment($event)"
        (focusChange)="onFocus($event)"
      />
      <p class="log" aria-live="polite">{{ message() }}</p>
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
      gap: 8px;
    }
    .log {
      margin: 0;
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SunburstChartEventsExample {
  readonly data: TxSunburstItem[] = [
    {
      label: 'North',
      children: [
        { label: 'Oslo', value: 12 },
        { label: 'Bergen', value: 6 },
      ],
    },
    {
      label: 'South',
      children: [
        { label: 'Rome', value: 15 },
        { label: 'Naples', value: 8 },
      ],
    },
  ];
  readonly message = signal('Click a segment or the centre.');

  onSegment(event: TxSunburstEvent): void {
    this.message.set(`${event.path.join(' / ')}: ${event.value}`);
  }

  onFocus(path: string[]): void {
    this.message.set(path.length ? `Zoomed into ${path.join(' / ')}` : 'Back at the top');
  }
}
