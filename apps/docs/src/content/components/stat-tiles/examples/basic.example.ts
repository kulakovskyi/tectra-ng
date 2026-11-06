import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-basic-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Store overview">
      <tx-stat-tile label="Orders" icon="shopping-cart" value="1,284" meta="Last 30 days" />
      <tx-stat-tile label="Revenue" icon="dollar" value="48,920" unit="EUR" meta="Last 30 days" />
      <tx-stat-tile label="Customers" icon="users" value="932" meta="312 new" />
      <tx-stat-tile label="Refunds" icon="arrow-down" [value]="null" meta="No data yet" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesBasicExample {}
