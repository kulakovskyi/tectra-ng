import { DestroyRef, Directive, ElementRef, inject } from '@angular/core';
import { TxOverlayInsets } from './overlay-insets.service';

@Directive({ selector: '[txOverlayInset]' })
export class TxOverlayInset {
  private unregister = inject(TxOverlayInsets).register(inject<ElementRef<HTMLElement>>(ElementRef).nativeElement);
  private readonly stopOnDestroy = inject(DestroyRef).onDestroy(() => this.unregister());
}
