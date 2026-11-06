import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxDivider } from '@tectra-ng/ui/divider';

@Component({
  selector: 'divider-types-example',
  imports: [TxDivider],
  template: `
    <tx-divider>Solid</tx-divider>
    <tx-divider type="dashed">Dashed</tx-divider>
    <tx-divider type="dotted">Dotted</tx-divider>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DividerTypesExample {}
