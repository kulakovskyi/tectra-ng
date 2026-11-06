import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-aside-example',
  imports: [TxStatTiles, TxStatTile, TxPill],
  template: `
    <tx-stat-tiles ariaLabel="Weekly traffic">
      <tx-stat-tile label="Visits" icon="eye" value="12,480" meta="vs. last week">
        <tx-pill txStatTileAside size="small" tone="success" icon="arrow-up">12%</tx-pill>
      </tx-stat-tile>
      <tx-stat-tile
        label="Bounce rate"
        icon="sign-out"
        tone="warn"
        value="41"
        unit="%"
        meta="vs. last week"
      >
        <tx-pill txStatTileAside size="small" tone="danger" icon="arrow-up">3%</tx-pill>
      </tx-stat-tile>
      <tx-stat-tile label="Devices" icon="desktop" tone="info" value="2" unit="types">
        <span class="split">Desktop 62% · Mobile 38%</span>
      </tx-stat-tile>
    </tx-stat-tiles>
  `,
  styles: `
    .split {
      color: var(--tx-text-muted);
      font-size: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesAsideExample {}
