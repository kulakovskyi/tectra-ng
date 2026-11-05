import { Directive, TemplateRef, inject } from '@angular/core';
import { TxSelectOptionContext } from './select.types';

@Directive({ selector: 'ng-template[txSelectOption]' })
export class TxSelectOptionTemplate {
  readonly templateRef = inject<TemplateRef<TxSelectOptionContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectValue]' })
export class TxSelectValueTemplate {
  readonly templateRef = inject<TemplateRef<TxSelectOptionContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectGroup]' })
export class TxSelectGroupTemplate {
  readonly templateRef = inject<TemplateRef<{ $implicit: unknown }>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectHeader]' })
export class TxSelectHeaderTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectFooter]' })
export class TxSelectFooterTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectEmpty]' })
export class TxSelectEmptyTemplate {
  readonly templateRef = inject(TemplateRef);
}

@Directive({ selector: 'ng-template[txSelectEmptyFilter]' })
export class TxSelectEmptyFilterTemplate {
  readonly templateRef = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);
}
