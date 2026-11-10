import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreemap, TxTreemapItem, TxTreemapTileTemplate } from '@tectra-ng/charts/treemap';

@Component({
  selector: 'treemap-tile-template-example',
  imports: [TxTreemap, TxTreemapTileTemplate],
  template: `
    <tx-treemap [items]="stores" [height]="320" ariaLabel="Sales by store">
      <ng-template txTreemapTile let-tile let-value="value" let-share="share">
        @if (tile.height > 56 && tile.width > 72) {
          <span class="share">{{ share }}</span>
          <span class="name">{{ tile.label }}</span>
          <span class="value">{{ value }} orders</span>
        } @else if (tile.width > 36 && tile.height > 24) {
          <span class="name">{{ share }}</span>
        }
      </ng-template>
    </tx-treemap>
  `,
  styles: `
    .share {
      font-size: 20px;
      font-weight: 700;
    }
    .name,
    .value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .value {
      opacity: 0.85;
      font-size: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapTileTemplateExample {
  readonly stores: TxTreemapItem[] = [
    { label: 'Berlin Mitte', value: 1840 },
    { label: 'Munich Central', value: 1320 },
    { label: 'Hamburg Port', value: 960 },
    { label: 'Cologne Old Town', value: 610 },
    { label: 'Leipzig', value: 380 },
    { label: 'Bremen', value: 140 },
  ];
}
