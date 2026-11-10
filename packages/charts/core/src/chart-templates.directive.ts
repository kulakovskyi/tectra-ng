import { Directive, TemplateRef, inject } from '@angular/core';
import { TxChartLegendContext, TxChartTooltipTemplateContext } from './chart.types';

@Directive({ selector: 'ng-template[txChartLegend]' })
export class TxChartLegendTemplate {
  readonly template = inject<TemplateRef<TxChartLegendContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxChartLegendTemplate, context: unknown): context is TxChartLegendContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txChartTooltip]' })
export class TxChartTooltipTemplate {
  readonly template = inject<TemplateRef<TxChartTooltipTemplateContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxChartTooltipTemplate, context: unknown): context is TxChartTooltipTemplateContext {
    return !!context;
  }
}
