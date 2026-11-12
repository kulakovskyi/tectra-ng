import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { TX_TABLE } from './table.context';

@Directive({
  selector: '[txTableEditorFocus]',
})
export class TxTableEditorFocus {
  constructor() {
    const table = inject(TX_TABLE);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => table.editorLoaded(host));
  }
}
