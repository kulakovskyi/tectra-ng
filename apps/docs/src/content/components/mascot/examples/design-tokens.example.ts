import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMascot } from '@tectra-ng/blocks/mascot';

@Component({
  selector: 'mascot-design-tokens-example',
  imports: [TxMascot],
  template: `
    <div class="row">
      <tx-mascot
        state="happy"
        label="Green mascot"
        [size]="72"
        [dt]="{
          root: {
            bodyColor: 'var(--tx-green-500)',
            shadeColor: 'var(--tx-green-700)',
            glowColor: 'var(--tx-green-300)',
          },
        }"
      />
      <tx-mascot
        state="sleeping"
        label="Purple mascot"
        [size]="72"
        [dt]="{
          root: {
            bodyColor: 'var(--tx-purple-500)',
            shadeColor: 'var(--tx-purple-700)',
            glowColor: 'var(--tx-purple-300)',
          },
        }"
      />
    </div>
  `,
  styles: `
    .row {
      display: flex;
      gap: 32px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotDesignTokensExample {}
