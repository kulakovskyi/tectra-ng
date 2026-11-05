import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tx-fluid, [txFluid]',
  template: '<ng-content />',
  styles: `:host { display: block; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxFluid {}
