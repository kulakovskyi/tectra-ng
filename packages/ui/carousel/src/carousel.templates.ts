import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxCarouselIndicatorContext, TxCarouselItemContext } from './carousel.types';

@Directive({ selector: 'ng-template[txCarouselItem]' })
export class TxCarouselItemTemplate<T> {
  readonly template = inject<TemplateRef<TxCarouselItemContext<T>>>(TemplateRef);
  readonly txCarouselItemOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxCarouselItemTemplate<T>, context: unknown): context is TxCarouselItemContext<T> {
    return !!context;
  }
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
