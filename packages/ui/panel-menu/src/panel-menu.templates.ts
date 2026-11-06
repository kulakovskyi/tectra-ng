import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPanelMenuItemContext } from './panel-menu.types';

@Directive({ selector: 'ng-template[txPanelMenuItem]' })
export class TxPanelMenuItemTemplate {
  readonly template = inject<TemplateRef<TxPanelMenuItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPanelMenuItemTemplate, context: unknown): context is TxPanelMenuItemContext {
    return !!context;
  }
}
