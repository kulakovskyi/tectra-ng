import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxSparkline } from '@tectra-ng/ui/sparkline';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'sparkline-stat-tiles-example',
  imports: [TxStatTiles, TxStatTile, TxPill, TxSparkline],
  template: `
    <tx-stat-tiles ariaLabel="Last 14 days">
      <tx-stat-tile label="Visits" icon="eye" value="12,480" meta="Last 14 days">
        <tx-pill txStatTileAside size="small" tone="success" icon="arrow-up">12%</tx-pill>
        <tx-sparkline [values]="visits" />
      </tx-stat-tile>
      <tx-stat-tile
        label="Sign-ups"
        icon="user-plus"
        tone="success"
        value="318"
        meta="Last 14 days"
      >
        <tx-pill txStatTileAside size="small" tone="success" icon="arrow-up">4%</tx-pill>
        <tx-sparkline tone="success" [values]="signUps" />
      </tx-stat-tile>
      <tx-stat-tile
        label="Errors"
        icon="exclamation-triangle"
        tone="danger"
        value="27"
        meta="Last 14 days"
      >
        <tx-pill txStatTileAside size="small" tone="danger" icon="arrow-up">9%</tx-pill>
        <tx-sparkline tone="danger" [values]="errors" />
      </tx-stat-tile>
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SparklineStatTilesExample {
  readonly visits = [780, 820, 760, 910, 880, 940, 990, 870, 920, 1010, 980, 1060, 1120, 1090];
  readonly signUps = [18, 20, 19, 22, 21, 24, 23, 22, 25, 24, 26, 25, 27, 28];
  readonly errors = [1, 0, 2, 1, 3, 1, 2, 2, 1, 4, 2, 3, 2, 3];
}
