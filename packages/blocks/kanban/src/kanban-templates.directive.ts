import { Directive, TemplateRef, inject } from '@angular/core';
import { TxKanbanCardContext, TxKanbanColumnContext } from './kanban.types';

@Directive({ selector: 'ng-template[txKanbanCard]' })
export class TxKanbanCard<T> {
  readonly template = inject<TemplateRef<TxKanbanCardContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TxKanbanCard<T>,
    context: unknown,
  ): context is TxKanbanCardContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txKanbanColumnHeader]' })
export class TxKanbanColumnHeader<T> {
  readonly template = inject<TemplateRef<TxKanbanColumnContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TxKanbanColumnHeader<T>,
    context: unknown,
  ): context is TxKanbanColumnContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txKanbanColumnTop]' })
export class TxKanbanColumnTop<T> {
  readonly template = inject<TemplateRef<TxKanbanColumnContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TxKanbanColumnTop<T>,
    context: unknown,
  ): context is TxKanbanColumnContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txKanbanColumnFooter]' })
export class TxKanbanColumnFooter<T> {
  readonly template = inject<TemplateRef<TxKanbanColumnContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TxKanbanColumnFooter<T>,
    context: unknown,
  ): context is TxKanbanColumnContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txKanbanEmpty]' })
export class TxKanbanEmpty<T> {
  readonly template = inject<TemplateRef<TxKanbanColumnContext<T>>>(TemplateRef);

  static ngTemplateContextGuard<T>(
    _directive: TxKanbanEmpty<T>,
    context: unknown,
  ): context is TxKanbanColumnContext<T> {
    return !!context;
  }
}
