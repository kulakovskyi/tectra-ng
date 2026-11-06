import { Directive, TemplateRef, inject } from '@angular/core';
import { TxStepContentContext, TxStepPanelContext, TxStepsItemContext } from './stepper.types';

@Directive({ selector: 'ng-template[txStepContent]' })
export class TxStepContent {
  readonly templateRef = inject<TemplateRef<TxStepContentContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxStepContent, context: unknown): context is TxStepContentContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txStepPanelContent]' })
export class TxStepPanelContent {
  readonly templateRef = inject<TemplateRef<TxStepPanelContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxStepPanelContent, context: unknown): context is TxStepPanelContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txStepsItem]' })
export class TxStepsItemTemplate {
  readonly templateRef = inject<TemplateRef<TxStepsItemContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxStepsItemTemplate, context: unknown): context is TxStepsItemContext {
    return !!context;
  }
}
