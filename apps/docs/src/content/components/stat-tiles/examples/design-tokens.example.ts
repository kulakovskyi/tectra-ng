import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-design-tokens-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Sales" [dt]="{ root: { gap: '24px' } }">
      <tx-stat-tile label="Orders" icon="shopping-cart" value="1,284" [dt]="tileTokens" />
      <tx-stat-tile label="Revenue" icon="dollar" value="48,920" unit="EUR" [dt]="tileTokens" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesDesignTokensExample {
  readonly tileTokens = {
    root: { borderRadius: 'var(--tx-radius-xl)', paddingX: '24px', paddingY: '20px' },
    icon: { borderRadius: 'var(--tx-radius-full)' },
    value: { fontSize: '32px' },
  };
}
