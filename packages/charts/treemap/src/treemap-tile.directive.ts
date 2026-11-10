import { Directive, TemplateRef, inject } from '@angular/core';
import { TxTreemapTileContext } from './treemap.types';

@Directive({ selector: 'ng-template[txTreemapTile]' })
export class TxTreemapTileTemplate {
  readonly template = inject<TemplateRef<TxTreemapTileContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxTreemapTileTemplate, context: unknown): context is TxTreemapTileContext {
    return !!context;
  }
}
