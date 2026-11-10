import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxHeatmapCellView } from './heatmap-cell.component';
import { TxHeatmapLegendItem, TxHeatmapScale } from './heatmap.types';
import { heatmapLevel } from './heatmap-layout';

@Component({
  selector: 'tx-heatmap-legend',
  imports: [TxHeatmapCellView],
  template: `
    <ul class="tx-heatmap-legend__list">
      @for (item of items(); track $index) {
        <li class="tx-heatmap-legend__item">
          <tx-heatmap-cell [cell]="{ tone: item.tone, value: item.value }" [level]="levelOf(item.value)" legend [unstyled]="isUnstyled()" />
          {{ item.label }}
        </li>
      }
      @if (emptyLabel()) {
        <li class="tx-heatmap-legend__item">
          <tx-heatmap-cell legend [unstyled]="isUnstyled()" />
          {{ emptyLabel() }}
        </li>
      }
    </ul>
  `,
  styleUrl: './heatmap-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-heatmap-legend',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxHeatmapLegend {
  readonly items = input<readonly TxHeatmapLegendItem[]>([]);
  readonly emptyLabel = input('');
  readonly scale = input<TxHeatmapScale | null>(null);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);

  levelOf(value: number | undefined): number | null {
    const scale = this.scale();
    return scale && typeof value === 'number' ? heatmapLevel(value, scale) : null;
  }
}
