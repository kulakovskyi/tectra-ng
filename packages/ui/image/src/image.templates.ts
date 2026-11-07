import { Directive, TemplateRef, inject } from '@angular/core';
import { TxImageIndicatorContext, TxImagePreviewContext } from './image.types';

@Directive({ selector: 'ng-template[txImageIndicator]' })
export class TxImageIndicatorTemplate {
  readonly template = inject<TemplateRef<TxImageIndicatorContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxImageIndicatorTemplate, context: unknown): context is TxImageIndicatorContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txImagePreview]' })
export class TxImagePreviewTemplate {
  readonly template = inject<TemplateRef<TxImagePreviewContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxImagePreviewTemplate, context: unknown): context is TxImagePreviewContext {
    return !!context;
  }
}
