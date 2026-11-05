import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';

@Component({
  selector: 'progress-spinner-basic-example',
  imports: [TxProgressSpinner],
  template: `<tx-progress-spinner />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressSpinnerBasicExample {}
