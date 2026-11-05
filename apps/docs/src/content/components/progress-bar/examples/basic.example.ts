import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-basic-example',
  imports: [TxProgressBar],
  template: `<tx-progress-bar [value]="45" ariaLabel="Profile completed" />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarBasicExample {}
