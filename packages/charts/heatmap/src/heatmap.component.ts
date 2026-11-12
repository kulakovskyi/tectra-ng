import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input, output, TemplateRef } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxHeatmapCellView } from './heatmap-cell.component';
import { heatmapLevel, heatmapRowGroups, heatmapScale } from './heatmap-layout';
import { TxHeatmapLegend } from './heatmap-legend.component';
import { TxHeatmapRowHeader, TxHeatmapRowValue } from './heatmap-templates.directive';
import {
  TxHeatmapCell,
  TxHeatmapCellClick,
  TxHeatmapCellSlot,
  TxHeatmapColumnGroup,
  TxHeatmapLabels,
  TxHeatmapLegendItem,
  TxHeatmapPart,
  TxHeatmapRow,
  TxHeatmapRowContext,
} from './heatmap.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { HEATMAP_ICON_DEFAULTS } from './heatmap.icons';

@Component({
  selector: 'tx-heatmap',
  imports: [NgTemplateOutlet, TxHeatmapCellView, TxHeatmapLegend],
  templateUrl: './heatmap.component.html',
  styleUrl: './heatmap.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-heatmap',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(HEATMAP_ICON_DEFAULTS)],
})
export class TxHeatmap {
  readonly translations = injectTranslations();

  readonly groups = input<readonly TxHeatmapColumnGroup[]>([]);
  readonly rows = input<readonly TxHeatmapRow[]>([]);
  readonly legend = input<readonly TxHeatmapLegendItem[]>([]);
  readonly labels = input<Partial<TxHeatmapLabels>>({});
  readonly maxHeight = input<string | undefined>(undefined);
  readonly scaleSteps = input(5);
  readonly scaleMin = input<number | undefined>(undefined);
  readonly scaleMax = input<number | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxHeatmapPart, TxHeatmap> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly cellClick = output<TxHeatmapCellClick>();

  readonly rowHeaderTemplate = contentChild(TxHeatmapRowHeader, { read: TemplateRef<TxHeatmapRowContext> });
  readonly rowValueTemplate = contentChild(TxHeatmapRowValue, { read: TemplateRef<TxHeatmapRowContext> });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('heatmap', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chart'), ...this.passThrough().root?.style }));

  readonly text = computed<TxHeatmapLabels>(() => {
    const t = this.translations();
    return { rowHeader: '', valueHeader: '', empty: t.chartNoData, region: t.chartHeatmap, ...this.labels() };
  });
  readonly scale = computed(() => heatmapScale(this.rows(), this.scaleSteps(), this.scaleMin(), this.scaleMax()));
  readonly layout = computed(() => {
    const groups = this.groups();
    const scale = this.scale();
    return this.rows().map((row) => ({
      row,
      context: { $implicit: row, row } satisfies TxHeatmapRowContext,
      groups: heatmapRowGroups(row.cells, groups).map((group) => ({
        ...group,
        slots: group.slots.map((slot) => ({ ...slot, level: heatmapLevel(slot.cell?.value, scale) })),
      })),
    }));
  });

  onCellActivate(row: TxHeatmapRow, slot: TxHeatmapCellSlot): void {
    const cell: TxHeatmapCell | null = slot.cell;
    if (cell?.interactive) {
      this.cellClick.emit({ row, cell, columnKey: slot.columnKey });
    }
  }
}
