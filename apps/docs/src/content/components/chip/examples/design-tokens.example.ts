import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxChip } from '@tectra/ui/chip';

@Component({
  selector: 'chip-design-tokens-example',
  imports: [TxChip],
  template: `<tx-chip
    label="Compact, square"
    icon="tag"
    [removable]="true"
    [dt]="{ root: { height: '24px', borderRadius: '6px', fontSize: '13px', paddingX: '8px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipDesignTokensExample {}
