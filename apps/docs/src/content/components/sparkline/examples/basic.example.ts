import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-basic-example',
  imports: [TxSparkline],
  template: `<tx-sparkline [values]="visits" />`,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineBasicExample {
  readonly visits = [120, 132, 101, 134, 190, 230, 210, 182, 191, 234, 290, 330];
}
