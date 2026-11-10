import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { heatmapCellLabel } from './heatmap-layout';
import { TxHeatmapCell } from './heatmap.types';

@Component({
  selector: 'tx-heatmap-cell',
  imports: [TxTooltip],
  templateUrl: './heatmap-cell.component.html',
  styleUrl: './heatmap-cell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-heatmap-cell',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxHeatmapCellView {
  readonly cell = input<TxHeatmapCell | null>(null);
  readonly level = input<number | null>(null);
  readonly legend = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly boxClass = input<string | undefined>(undefined);
  readonly boxStyle = input<Record<string, string> | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly activate = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly label = computed(() => {
    const cell = this.cell();
    return cell ? heatmapCellLabel(cell) : null;
  });
  readonly kind = computed(() => {
    const cell = this.cell();
    if (!cell) {
      return 'empty';
    }
    if (cell.hidden) {
      return 'hidden';
    }
    if (typeof cell.value === 'number' && !cell.tone) {
      return (this.level() ?? 0) > 0 ? 'scale' : 'empty';
    }
    return cell.tone ?? 'empty';
  });
  readonly levelStyle = computed(() => {
    const level = this.level();
    return this.kind() === 'scale' && level ? `${Math.round(level * 100)}%` : null;
  });
}
