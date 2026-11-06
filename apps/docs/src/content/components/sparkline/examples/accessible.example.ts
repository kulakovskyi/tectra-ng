import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-accessible-example',
  imports: [TxSparkline],
  template: `<tx-sparkline
    tone="success"
    ariaLabel="Revenue rose from 4,200 to 6,900 EUR over 8 weeks"
    [values]="revenue"
  />`,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineAccessibleExample {
  readonly revenue = [4200, 4500, 4400, 5100, 5600, 5400, 6300, 6900];
}
