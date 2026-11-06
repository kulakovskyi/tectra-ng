import { Directive, TemplateRef, inject } from '@angular/core';
import { TxMonthCalendarEventContext } from './month-calendar.types';

@Directive({ selector: 'ng-template[txMonthCalendarEvent]' })
export class TxMonthCalendarEventTemplate {
  readonly templateRef = inject<TemplateRef<TxMonthCalendarEventContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxMonthCalendarEventTemplate, context: unknown): context is TxMonthCalendarEventContext {
    return !!context;
  }
}
