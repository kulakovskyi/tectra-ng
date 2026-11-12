import { Directive, ElementRef, HostAttributeToken, inject, input, output } from '@angular/core';
import { TxClipboard } from './clipboard';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CLIPBOARD_ICON_DEFAULTS } from './clipboard.icons';

const NATIVE_CONTROLS = ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA', 'SUMMARY'];

@Directive({
  selector: '[txCopy]',
  exportAs: 'txCopy',
  host: {
    '[attr.role]': 'needsRole ? "button" : null',
    '[attr.tabindex]': 'needsRole ? 0 : null',
    '(click)': 'copy()',
    '(keydown.enter)': 'onKey($event)',
    '(keydown.space)': 'onKey($event)',
  },
  providers: [provideTxIconDefaults(CLIPBOARD_ICON_DEFAULTS)],
})
export class TxCopy {
  private readonly clipboard = inject(TxClipboard);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  readonly value = input<string | number | null | undefined>(undefined, { alias: 'txCopy' });
  readonly copyMessage = input<string | false | undefined>(undefined);
  readonly copyErrorMessage = input<string | false | undefined>(undefined);

  readonly copied = output<string>();
  readonly copyFailed = output<string>();

  protected readonly needsRole = !NATIVE_CONTROLS.includes(this.element.tagName.toUpperCase()) && inject(new HostAttributeToken('role'), { optional: true }) === null;

  async copy(): Promise<boolean> {
    const value = this.value();
    const text = value === null || value === undefined ? '' : String(value);
    if (!text) {
      return false;
    }
    const done = await this.clipboard.copy(text, { message: this.copyMessage(), errorMessage: this.copyErrorMessage() });
    if (done) {
      this.copied.emit(text);
    } else {
      this.copyFailed.emit(text);
    }
    return done;
  }

  protected onKey(event: Event): void {
    if (this.needsRole) {
      event.preventDefault();
      void this.copy();
    }
  }
}
