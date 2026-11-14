import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxTreeCheckboxIconContext, TxTreeFilterContext, TxTreeNode, TxTreeNodeContext, TxTreeToggleIconContext } from './tree.types';

@Directive({ selector: 'ng-template[txTreeNode]' })
export class TxTreeNodeTemplate<T> {
  readonly templateRef = inject<TemplateRef<TxTreeNodeContext<T>>>(TemplateRef);
  readonly txTreeNode = input<string>('');
  readonly txTreeNodeOf = input<readonly TxTreeNode<T>[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTreeNodeTemplate<T>, context: unknown): context is TxTreeNodeContext<T> {
    return !!context;
  }
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

  static ngTemplateContextGuard(_directive: TxTreeFilter, context: unknown): context is TxTreeFilterContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTreeToggleIcon]' })
export class TxTreeToggleIcon {
  readonly templateRef = inject<TemplateRef<TxTreeToggleIconContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxTreeToggleIcon, context: unknown): context is TxTreeToggleIconContext {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTreeCheckboxIcon]' })
export class TxTreeCheckboxIcon {
  readonly templateRef = inject<TemplateRef<TxTreeCheckboxIconContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxTreeCheckboxIcon, context: unknown): context is TxTreeCheckboxIconContext {
    return !!context;
  }
}
