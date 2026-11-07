import { Directive, TemplateRef, inject } from '@angular/core';
import { TxCarouselIndicatorContext, TxCarouselItemContext } from './carousel.types';

@Directive({ selector: 'ng-template[txCarouselItem]' })
export class TxCarouselItemTemplate {
  readonly template = inject<TemplateRef<TxCarouselItemContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txCarouselIndicator]' })
export class TxCarouselIndicatorTemplate {
  readonly template = inject<TemplateRef<TxCarouselIndicatorContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxCarouselIndicatorTemplate, context: unknown): context is TxCarouselIndicatorContext {
    return !!context;
  }
}

@Directive({ selector: '[txCarouselHeader]' })
export class TxCarouselHeader {}

@Directive({ selector: '[txCarouselFooter]' })
export class TxCarouselFooter {}
