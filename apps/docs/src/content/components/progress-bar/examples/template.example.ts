import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxProgressBar, TxProgressBarValueTemplate } from '@tectra/ui/progress-bar';

@Component({
  selector: 'progress-bar-template-example',
  imports: [TxProgressBar, TxProgressBarValueTemplate],
  template: `
    <tx-progress-bar [value]="3" [max]="5" [showValue]="true" ariaLabel="Onboarding steps">
      <ng-template txProgressBarValue let-value>Step {{ value }} of 5</ng-template>
    </tx-progress-bar>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ProgressBarTemplateExample {}
