import { Directive, ElementRef, booleanAttribute, inject, input, numberAttribute, output } from '@angular/core';

@Directive({
  selector: '[txScrollEnd]',
  exportAs: 'txScrollEnd',
  host: { '(scroll)': 'check()' },
})
export class TxScrollEnd {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private reportedHeight = -1;

  readonly offset = input<number, unknown>(48, { transform: numberAttribute });
  readonly maxLimit = input<number, unknown>(Number.POSITIVE_INFINITY, { transform: numberAttribute });
  readonly currentCount = input<number, unknown>(0, { transform: numberAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly scrolledToBottom = output<void>();

  check(): void {
    const { scrollHeight, scrollTop, clientHeight } = this.host;
    const atEnd = scrollHeight - scrollTop - clientHeight <= this.offset();
    if (!atEnd || this.disabled() || this.currentCount() >= this.maxLimit() || scrollHeight === this.reportedHeight) {
      return;
    }
    this.reportedHeight = scrollHeight;
    this.scrolledToBottom.emit();
  }

  reset(): void {
    this.reportedHeight = -1;
  }
}
