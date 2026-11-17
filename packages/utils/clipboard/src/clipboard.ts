import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { writeToClipboard } from '@tectra-ng/core/utils';
import { TxToastService } from '@tectra-ng/ui/toast';

/** Toasts shown after a copy. */
export interface TxCopyOptions {
  /** Success toast text; `false` shows none (default: the translated "copied" text). */
  message?: string | false;
  /** Error toast text; `false` shows none (default: the translated "copy failed" text). */
  errorMessage?: string | false;
}

export function copyToClipboard(text: string, document: Document | undefined = globalThis.document): Promise<boolean> {
  return writeToClipboard(text, document);
}

/** Copies text to the clipboard and tells the user with a kit toast; needs `<tx-toast />` in the app shell. */
@Injectable({ providedIn: 'root' })
export class TxClipboard {
  private readonly document = inject(DOCUMENT);
  private readonly toast = inject(TxToastService);
  private readonly locale = inject(TxLocaleService);

  async copy(value: string | number | null | undefined, options: TxCopyOptions = {}): Promise<boolean> {
    const text = value === null || value === undefined ? '' : String(value);
    if (!text) {
      return false;
    }
    const copied = await copyToClipboard(text, this.document);
    if (copied && options.message !== false) {
      this.toast.success(options.message ?? this.locale.translate('copiedToClipboard'));
    }
    if (!copied && options.errorMessage !== false) {
      this.toast.error(options.errorMessage ?? this.locale.translate('copyToClipboardFailed'));
    }
    return copied;
  }
}
