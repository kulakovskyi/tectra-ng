import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'card-media-example',
  imports: [TxCard],
  template: `
    <tx-card title="Visitors" subtitle="Last 30 days" class="card">
      <img txCardHeader [src]="chart" alt="Visitors grow from 1,200 to 2,900 a day" />
      The busiest day was Thursday, with 2,900 visitors.
    </tx-card>
  `,
  styles: `
    .card {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardMediaExample {
  readonly chart = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 160"><rect width="400" height="160" fill="#eef2ff"/><path d="M0 120 L50 100 L100 110 L150 70 L200 80 L250 50 L300 60 L350 30 L400 40 L400 160 L0 160Z" fill="#c7d2fe"/><path d="M0 120 L50 100 L100 110 L150 70 L200 80 L250 50 L300 60 L350 30 L400 40" fill="none" stroke="#4f46e5" stroke-width="3"/></svg>')}`;
}
