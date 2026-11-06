import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSparkline } from '@tectra-ng/ui/sparkline';

@Component({
  selector: 'sparkline-design-tokens-example',
  imports: [TxSparkline],
  template: `
    <tx-sparkline
      [values]="values"
      [dt]="{
        root: { height: '56px', strokeWidth: '3', areaOpacity: '0.24' },
        tone: { primary: 'var(--tx-help-base)' },
      }"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineDesignTokensExample {
  readonly values = [5, 9, 7, 12, 10, 15, 13, 18];
}
