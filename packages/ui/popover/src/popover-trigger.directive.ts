import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { TxPopover } from './popover.component';

@Directive({
  selector: '[txPopoverTrigger]',
  host: {
    'aria-haspopup': 'dialog',
    '[attr.aria-expanded]': 'txPopoverTrigger().isOpenFor(host)',
    '[attr.aria-controls]': 'txPopoverTrigger().isOpenFor(host) ? txPopoverTrigger().id : null',
    '(click)': 'txPopoverTrigger().toggle(host)',
  },
})
export class TxPopoverTrigger {
  readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly txPopoverTrigger = input.required<TxPopover>();

  constructor() {
    effect((onCleanup) => onCleanup(this.txPopoverTrigger().registerTrigger(this.host)));
  }
}
