import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCard } from '@tectra/ui/card';

@Component({
  selector: 'card-basic-example',
  imports: [TxCard],
  template: `
    <tx-card title="Weekly report" subtitle="Nov 3 – 9" class="card">
      Visitors grew 12% compared with last week. Most of them came from search.
    </tx-card>
  `,
  styles: `
    .card {
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CardBasicExample {}
