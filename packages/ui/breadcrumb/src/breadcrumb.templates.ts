import { Directive, TemplateRef, inject } from '@angular/core';
import { TxBreadcrumbItemContext } from './breadcrumb.types';

@Directive({ selector: 'ng-template[txBreadcrumbItem]' })
export class TxBreadcrumbItemTemplate {
  readonly templateRef = inject<TemplateRef<TxBreadcrumbItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxBreadcrumbItemTemplate, context: unknown): context is TxBreadcrumbItemContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txBreadcrumbSeparator]' })
export class TxBreadcrumbSeparatorTemplate {
  readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);
}
