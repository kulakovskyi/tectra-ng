import { Directive, TemplateRef, inject } from '@angular/core';
import { TxPopoverContentContext } from './popover.types';

@Directive({ selector: '[txPopoverHeader]' })
export class TxPopoverHeader {}

@Directive({ selector: '[txPopoverFooter]' })
export class TxPopoverFooter {}

@Directive({ selector: 'ng-template[txPopoverContent]' })
export class TxPopoverContent {
  readonly template = inject<TemplateRef<TxPopoverContentContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxPopoverContent, context: unknown): context is TxPopoverContentContext {
    return !!context;
  }
}
