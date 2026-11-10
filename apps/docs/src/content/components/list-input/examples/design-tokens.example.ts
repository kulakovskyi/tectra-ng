import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-design-tokens-example',
  imports: [TxListInput],
  template: `
    <tx-list-input
      type="text"
      ariaLabel="Keywords"
      text="summer, sale"
      [rows]="3"
      [dt]="{
        root: { borderRadius: '16px' },
        field: { fontFamily: 'inherit', fontSize: '14px', minHeight: '80px' },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputDesignTokensExample {}
