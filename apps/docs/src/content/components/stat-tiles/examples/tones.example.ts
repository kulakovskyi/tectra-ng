import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTileTone, TxStatTiles } from '@tectra-ng/ui/stat-tiles';
import { TxIconName } from '@tectra-ng/icons';

@Component({
  selector: 'stat-tiles-tones-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Server health">
      @for (tile of tiles; track tile.tone) {
        <tx-stat-tile
          [label]="tile.label"
          [icon]="tile.icon"
          [tone]="tile.tone"
          [value]="tile.value"
        />
      }
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesTonesExample {
  readonly tiles: { label: string; icon: TxIconName; tone: TxStatTileTone; value: number }[] = [
    { label: 'Servers', icon: 'server', tone: 'neutral', value: 24 },
    { label: 'Deploys', icon: 'send', tone: 'primary', value: 186 },
    { label: 'Healthy', icon: 'check-circle', tone: 'success', value: 21 },
    { label: 'Updating', icon: 'sync', tone: 'info', value: 1 },
    { label: 'Slow', icon: 'clock', tone: 'warn', value: 1 },
    { label: 'Down', icon: 'times-circle', tone: 'danger', value: 1 },
  ];
}
