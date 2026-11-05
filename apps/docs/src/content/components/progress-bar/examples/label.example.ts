import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-label-example',
  imports: [TxProgressBar],
  template: `<tx-progress-bar [value]="72" [showValue]="true" ariaLabel="Storage used" />`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarLabelExample {}
