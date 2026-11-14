import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxGalleriaIndicatorContext, TxGalleriaItemContext, TxGalleriaThumbnailContext } from './galleria.types';

@Directive({ selector: 'ng-template[txGalleriaItem]' })
export class TxGalleriaItemTemplate<T> {
  readonly template = inject<TemplateRef<TxGalleriaItemContext<T>>>(TemplateRef);
  readonly txGalleriaItemOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxGalleriaItemTemplate<T>, context: unknown): context is TxGalleriaItemContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txGalleriaThumbnail]' })
export class TxGalleriaThumbnailTemplate<T> {
  readonly template = inject<TemplateRef<TxGalleriaThumbnailContext<T>>>(TemplateRef);
  readonly txGalleriaThumbnailOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxGalleriaThumbnailTemplate<T>, context: unknown): context is TxGalleriaThumbnailContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txGalleriaCaption]' })
export class TxGalleriaCaptionTemplate<T> {
  readonly template = inject<TemplateRef<TxGalleriaItemContext<T>>>(TemplateRef);
  readonly txGalleriaCaptionOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxGalleriaCaptionTemplate<T>, context: unknown): context is TxGalleriaItemContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txGalleriaIndicator]' })
export class TxGalleriaIndicatorTemplate {
  readonly template = inject<TemplateRef<TxGalleriaIndicatorContext>>(TemplateRef);

  static ngTemplateContextGuard(_directive: TxGalleriaIndicatorTemplate, context: unknown): context is TxGalleriaIndicatorContext {
    return !!context;
  }
}

@Directive({ selector: '[txGalleriaHeader]' })
export class TxGalleriaHeader {}

@Directive({ selector: '[txGalleriaFooter]' })
export class TxGalleriaFooter {}
