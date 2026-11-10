import { Directive } from '@angular/core';
import { TxHeatmapRowContext } from './heatmap.types';

@Directive({ selector: 'ng-template[txHeatmapRowHeader]' })
export class TxHeatmapRowHeader {
  static ngTemplateContextGuard(_directive: TxHeatmapRowHeader, context: unknown): context is TxHeatmapRowContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txHeatmapRowValue]' })
export class TxHeatmapRowValue {
  static ngTemplateContextGuard(_directive: TxHeatmapRowValue, context: unknown): context is TxHeatmapRowContext {
    return !!context;
  }
}
