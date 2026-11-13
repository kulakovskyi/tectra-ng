import { Directive, ElementRef, afterNextRender, inject } from '@angular/core';
import { TX_TABLE } from './table.context';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABLE_ICON_DEFAULTS } from './table.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { TABLE_THEME } from './table.theme';

/** Tells `tx-table` that an editor element is ready so it can take focus. */
@Directive({
  selector: '[txTableEditorFocus]',
  providers: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableEditorFocus {
  private readonly tableTheme = injectTokens(TABLE_THEME);

  constructor() {
    const table = inject(TX_TABLE);
    const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    afterNextRender(() => table.editorLoaded(host));
  }
}
