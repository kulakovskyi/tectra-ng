import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMascot } from '@tectra-ng/blocks/mascot';

@Component({
  selector: 'mascot-basic-example',
  imports: [TxMascot],
  template: `<tx-mascot label="Assistant" [size]="72" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotBasicExample {}
