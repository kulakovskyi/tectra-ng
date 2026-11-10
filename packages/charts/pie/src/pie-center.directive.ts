import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPieCenterContext } from './pie-chart.types';

@Directive({ selector: 'ng-template[txPieCenter]' })
export class TxPieCenter {
  readonly template = inject<TemplateRef<TxPieCenterContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPieCenter, context: unknown): context is TxPieCenterContext {
    return !!context;
  }
}
