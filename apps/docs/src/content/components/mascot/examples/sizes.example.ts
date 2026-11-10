import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMascot } from '@tectra-ng/blocks/mascot';

@Component({
  selector: 'mascot-sizes-example',
  imports: [TxMascot],
  template: `
    <div class="row">
      <tx-mascot [size]="24" [playful]="false" />
      <tx-mascot [playful]="false" />
      <tx-mascot [size]="96" [playful]="false" />
      <tx-mascot size="9rem" [playful]="false" />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-end;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotSizesExample {}
