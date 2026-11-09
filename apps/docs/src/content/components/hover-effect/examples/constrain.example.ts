import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxHoverEffect } from '@tectra-ng/blocks/hover-effect';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'hover-effect-constrain-example',
  imports: [TxHoverEffect, TxCard],
  template: `
    <div class="row">
      <tx-hover-effect class="tile" [constrain]="40">
        <tx-card title="Lively" subtitle="constrain 40" />
      </tx-hover-effect>
      <tx-hover-effect class="tile">
        <tx-card title="Default" subtitle="constrain 100" />
      </tx-hover-effect>
      <tx-hover-effect class="tile" [constrain]="250">
        <tx-card title="Calm" subtitle="constrain 250" />
      </tx-hover-effect>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
    }

    .tile {
      flex: 1 1 180px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HoverEffectConstrainExample {}
