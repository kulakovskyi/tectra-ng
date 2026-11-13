import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Container that makes the form fields inside it fill the full width of their row. */
@Component({
  selector: 'tx-fluid, [txFluid]',
  template: '<ng-content />',
  styles: `:host { display: block; }`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxFluid {}
