import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra/ui/card';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'card-custom-title-example',
  imports: [TxCard, TxPill],
  template: `
    <tx-card subtitle="Updated today" class="card">
      <div txCardTitle class="title">
        Release 2.4 <tx-pill tone="success" size="small">Live</tx-pill>
      </div>
      Faster search and a new export format.
    </tx-card>
  `,
  styles: `
    .card {
      max-width: 360px;
    }
    .title {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardCustomTitleExample {}
