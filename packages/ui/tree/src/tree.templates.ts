import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxTreeCheckboxIconContext, TxTreeFilterContext, TxTreeNodeContext, TxTreeToggleIconContext } from './tree.types';

@Directive({ selector: 'ng-template[txTreeNode]' })
export class TxTreeNodeTemplate {
  readonly templateRef = inject<TemplateRef<TxTreeNodeContext>>(TemplateRef);
  readonly txTreeNode = input<string>('');
}

@Directive({ selector: 'ng-template[txTreeHeader]' })
export class TxTreeHeader {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeFooter]' })
export class TxTreeFooter {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeEmpty]' })
export class TxTreeEmpty {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeLoading]' })
export class TxTreeLoading {
  readonly templateRef = inject<TemplateRef<void>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeFilter]' })
export class TxTreeFilter {
  readonly templateRef = inject<TemplateRef<TxTreeFilterContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeToggleIcon]' })
export class TxTreeToggleIcon {
  readonly templateRef = inject<TemplateRef<TxTreeToggleIconContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTreeCheckboxIcon]' })
export class TxTreeCheckboxIcon {
  readonly templateRef = inject<TemplateRef<TxTreeCheckboxIconContext>>(TemplateRef);
}
