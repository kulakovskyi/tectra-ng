import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-design-tokens-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="priorities"
    [placeholder]="'Priority'"
    [dt]="{
      overlay: { borderRadius: '16px' },
      list: { padding: '8px', gap: '4px' },
      option: { borderRadius: '999px', padding: '6px 14px' },
    }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectDesignTokensExample {
  readonly priorities = ['Low', 'Normal', 'High', 'Critical'];
}
