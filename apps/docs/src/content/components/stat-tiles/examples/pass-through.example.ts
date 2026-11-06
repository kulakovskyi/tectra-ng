import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-pass-through-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Team">
      <tx-stat-tile label="Members" icon="users" value="18" meta="3 invited" [pt]="pt" />
      <tx-stat-tile label="Projects" icon="folder" value="42" meta="7 archived" [pt]="pt" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesPassThroughExample {
  readonly pt = {
    label: { style: { textTransform: 'uppercase', letterSpacing: '0.04em' } },
    meta: { style: { fontStyle: 'italic' } },
  };
}
