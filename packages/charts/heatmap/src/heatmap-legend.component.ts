import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectTokens, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxHeatmapCellView } from './heatmap-cell.component';
import { TxHeatmapLegendItem, TxHeatmapScale } from './heatmap.types';
import { heatmapLevel } from './heatmap-layout';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { HEATMAP_ICON_DEFAULTS } from './heatmap.icons';
import { HEATMAP_THEME } from './heatmap.theme';

/** The legend under `tx-heatmap`: a sample cell with a label for each entry, and an entry for empty cells. */
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
  viewProviders: [provideTxIconDefaults(HEATMAP_ICON_DEFAULTS)],
})
export class TxHeatmapLegend {
  private readonly heatmapTheme = injectTokens(HEATMAP_THEME);

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
