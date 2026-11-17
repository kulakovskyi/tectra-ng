import { ChangeDetectionStrategy, Component, booleanAttribute, input, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxStatTile, TxStatTiles, provideTxStatTilesRelay } from '@tectra-ng/ui/stat-tiles';

@Component({
  selector: 'queue-stats',
  imports: [TxStatTiles],
  providers: [provideTxStatTilesRelay()],
  template: `
    <tx-stat-tiles ariaLabel="Queue" minWidth="9rem" [compact]="compact()">
      <ng-content />
    </tx-stat-tiles>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QueueStats {
  readonly compact = input(false, { transform: booleanAttribute });
}

@Component({
  selector: 'stat-tiles-wrapper-example',
  imports: [QueueStats, TxStatTile, TxButton],
  template: `
    <button txButton severity="secondary" outlined (click)="compact.set(!compact())">
      {{ compact() ? 'Regular tiles' : 'Compact tiles' }}
    </button>
    <queue-stats class="stats" [compact]="compact()">
      <tx-stat-tile label="Queued" icon="clock" tone="neutral" value="42" />
      <tx-stat-tile label="Running" icon="sync" tone="info" value="8" />
      <tx-stat-tile label="Failed" icon="times" tone="danger" value="3" [compact]="false" />
    </queue-stats>
  `,
  styles: `
    .stats {
      display: block;
      margin-top: 14px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StatTilesWrapperExample {
  readonly compact = signal(true);
}
