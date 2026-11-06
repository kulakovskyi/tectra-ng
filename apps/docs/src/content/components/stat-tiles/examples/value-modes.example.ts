import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-value-modes-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Value modes">
      <tx-stat-tile
        label="Top page"
        icon="file"
        value="/pricing/enterprise-plans-and-volume-discounts"
        textValue
        meta="2,410 visits"
      />
      <tx-stat-tile label="Revenue" icon="dollar" value="1,284,903,220" unit="EUR" fitValue />
      <tx-stat-tile
        label="Uptime"
        icon="check-circle"
        tone="success"
        value="99.98"
        unit="%"
        accentValue
      />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesValueModesExample {}
