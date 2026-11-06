import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-min-width-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Billing" minWidth="20rem">
      <tx-stat-tile
        label="Monthly plan"
        icon="credit-card"
        value="249"
        unit="EUR"
        meta="Renews on 1 December"
      />
      <tx-stat-tile
        label="Usage this month"
        icon="chart-line"
        value="81"
        unit="%"
        [share]="81"
        tone="warn"
      />
      <tx-stat-tile label="Seats" icon="users" value="18" unit="of 25" [share]="72" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesMinWidthExample {}
