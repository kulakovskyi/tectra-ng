import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra/ui/pill';

@Component({
  selector: 'pill-design-tokens-example',
  imports: [TxPill],
  template: `<tx-pill
    tone="primary"
    icon="bolt"
    [dt]="{ root: { borderRadius: '6px', tint: '20%', paddingX: '10px' } }"
    >Beta</tx-pill
  >`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PillDesignTokensExample {}
