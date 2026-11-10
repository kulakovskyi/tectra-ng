import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTreemap, TxTreemapItem, TxTreemapTileEvent } from '@tectra-ng/charts/treemap';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'treemap-nested-example',
  imports: [TxTreemap, TxMessage],
  template: `
    <div class="wrap">
      <tx-treemap
        [items]="regions"
        [height]="380"
        ariaLabel="Visitors by region and country"
        (tileClick)="clicked.set($event)"
      />
      <tx-message severity="secondary" size="small">
        @if (clicked(); as tile) {
          {{ tile.group }} / {{ tile.label }}: {{ tile.value }} visitors
        } @else {
          Click a country.
        }
      </tx-message>
    </div>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapNestedExample {
  readonly clicked = signal<TxTreemapTileEvent | null>(null);
  readonly regions: TxTreemapItem[] = [
    {
      label: 'Europe',
      children: [
        { label: 'Germany', value: 4200 },
        { label: 'France', value: 3100 },
        { label: 'Poland', value: 1900 },
        { label: 'Spain', value: 1500 },
      ],
    },
    {
      label: 'Americas',
      children: [
        { label: 'United States', value: 5200 },
        { label: 'Canada', value: 1400 },
        { label: 'Brazil', value: 1100 },
      ],
    },
    {
      label: 'Asia',
      children: [
        { label: 'Japan', value: 2300 },
        { label: 'India', value: 1800 },
      ],
    },
  ];
}
