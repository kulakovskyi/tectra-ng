import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxDivider } from '@tectra/ui/divider';
import { TxIcon } from '@tectra/icons';

@Component({
  selector: 'divider-content-example',
  imports: [TxDivider, TxIcon],
  template: `
    <tx-divider align="start">Personal</tx-divider>
    <tx-divider>or continue with</tx-divider>
    <tx-divider align="end"><tx-icon name="star" /></tx-divider>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DividerContentExample {}
