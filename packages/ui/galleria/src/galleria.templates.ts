import { Directive, TemplateRef, inject } from '@angular/core';
import { TxGalleriaIndicatorContext, TxGalleriaItemContext, TxGalleriaThumbnailContext } from './galleria.types';

@Directive({ selector: 'ng-template[txGalleriaItem]' })
export class TxGalleriaItemTemplate {
  readonly template = inject<TemplateRef<TxGalleriaItemContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txGalleriaThumbnail]' })
export class TxGalleriaThumbnailTemplate {
  readonly template = inject<TemplateRef<TxGalleriaThumbnailContext>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txGalleriaCaption]' })
export class TxGalleriaCaptionTemplate {
  readonly template = inject<TemplateRef<TxGalleriaItemContext>>(TemplateRef);
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
