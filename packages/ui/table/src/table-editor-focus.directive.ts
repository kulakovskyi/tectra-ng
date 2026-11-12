import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { TX_TABLE } from './table.context';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABLE_ICON_DEFAULTS } from './table.icons';

@Directive({
  selector: '[txTableEditorFocus]',
  providers: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableEditorFocus {
  constructor() {
    const table = inject(TX_TABLE);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => table.editorLoaded(host));
  }
}
