import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHoverEffect } from '@tectra-ng/blocks/hover-effect';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'hover-effect-design-tokens-example',
  imports: [TxHoverEffect, TxCard],
  template: `
    <tx-hover-effect
      class="tile"
      [constrain]="20"
      [dt]="{ root: { perspective: '600px', resetDuration: '1200ms' } }"
    >
      <tx-card title="Deep" subtitle="A far perspective and a slow return" />
    </tx-hover-effect>
  `,
  styles: `
    .tile {
      width: 100%;
      max-width: 300px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HoverEffectDesignTokensExample {}
