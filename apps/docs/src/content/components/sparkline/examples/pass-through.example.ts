import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-pass-through-example',
  imports: [TxSparkline],
  template: `<tx-sparkline tone="warn" [values]="values" [pt]="pt" />`,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklinePassThroughExample {
  readonly values = [14, 11, 13, 9, 10, 7, 8, 5];
  readonly pt = {
    area: { style: { opacity: '0' } },
    line: { style: { strokeDasharray: '4 3' } },
  };
}
