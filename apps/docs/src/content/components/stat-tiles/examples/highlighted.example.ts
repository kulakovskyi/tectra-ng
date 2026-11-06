import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxStatTile, TxStatTiles } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'stat-tiles-highlighted-example',
  imports: [TxStatTiles, TxStatTile],
  template: `
    <tx-stat-tiles ariaLabel="Invoices">
      <tx-stat-tile label="Paid" icon="check-circle" tone="success" value="128" />
      <tx-stat-tile
        label="Overdue"
        icon="exclamation-triangle"
        tone="danger"
        value="7"
        meta="Needs attention"
        highlighted
      />
      <tx-stat-tile label="Drafts" icon="file" tone="neutral" value="3" />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesHighlightedExample {}
