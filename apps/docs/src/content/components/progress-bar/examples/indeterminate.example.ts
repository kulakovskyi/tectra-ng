import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-indeterminate-example',
  imports: [TxProgressBar],
  template: `<tx-progress-bar mode="indeterminate" ariaLabel="Preparing the export" />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarIndeterminateExample {}
