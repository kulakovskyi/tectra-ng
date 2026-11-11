import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxSankeyChart,
  TxSankeyLink,
  TxSankeyLinkEvent,
  TxSankeyNodeEvent,
} from '@tectra-ng/charts/sankey';

@Component({
  selector: 'sankey-chart-events-example',
  imports: [TxSankeyChart],
  template: `
    <div class="wrap">
      <tx-sankey-chart
        [links]="links"
        [height]="260"
        ariaLabel="Leads by stage"
        (nodeClick)="onNode($event)"
        (linkClick)="onLink($event)"
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
export default class SankeyChartEventsExample {
  readonly links: TxSankeyLink[] = [
    { source: 'Leads', target: 'Qualified', value: 420 },
    { source: 'Leads', target: 'Lost', value: 380 },
    { source: 'Qualified', target: 'Won', value: 160 },
    { source: 'Qualified', target: 'Lost', value: 260 },
  ];
  readonly message = signal('Click a node or a link.');

  onNode(event: TxSankeyNodeEvent): void {
    this.message.set(`${event.label}: in ${event.incoming}, out ${event.outgoing}`);
  }

  onLink(event: TxSankeyLinkEvent): void {
    this.message.set(`${event.source} → ${event.target}: ${event.value}`);
  }
}
