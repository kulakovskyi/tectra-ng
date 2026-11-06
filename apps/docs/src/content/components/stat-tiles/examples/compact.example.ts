import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-compact-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Queue" compact minWidth="9rem">
      <tx-stat-tile label="Queued" icon="clock" tone="neutral" value="42" />
      <tx-stat-tile label="Running" icon="sync" tone="info" value="8" />
      <tx-stat-tile label="Done" icon="check" tone="success" value="1,920" />
      <tx-stat-tile label="Failed" icon="times" tone="danger" value="3" />
      <tx-stat-tile label="Retried" icon="replay" tone="warn" value="5" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesCompactExample {}
