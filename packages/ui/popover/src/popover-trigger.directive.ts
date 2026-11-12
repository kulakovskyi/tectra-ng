import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { TxPopover } from './popover.component';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { POPOVER_ICON_DEFAULTS } from './popover.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { POPOVER_THEME } from './popover.theme';

@Directive({
  selector: '[txPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'txPopoverTrigger().isOpenFor(host)',
    '[attr.aria-controls]': 'txPopoverTrigger().isOpenFor(host) ? txPopoverTrigger().id : null',
    '(click)': 'txPopoverTrigger().toggle(host)',
  },
  providers: [provideTxIconDefaults(POPOVER_ICON_DEFAULTS)],
})
export class TxPopoverTrigger {
  private readonly popoverTheme = injectTokens(POPOVER_THEME);

  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly txPopoverTrigger = input.required<TxPopover>();

  constructor() {
    effect((onCleanup) => onCleanup(this.txPopoverTrigger().registerTrigger(this.host)));
  }
}
