import { Directive, TemplateRef, inject } from '@angular/core';
import { TxOrgChartNodeContext } from './org-chart.types';

@Directive({ selector: 'ng-template[txOrgChartNode]' })
export class TxOrgChartNodeTemplate {
  readonly template = inject<TemplateRef<TxOrgChartNodeContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxOrgChartNodeTemplate, context: unknown): context is TxOrgChartNodeContext {
    return !!context;
  }
}
