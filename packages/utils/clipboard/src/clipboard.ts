import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxToastService } from '@tectra-ng/ui/toast';

/** Toasts shown after a copy. */
export interface TxCopyOptions {
  /** Success toast text; `false` shows none (default: the translated "copied" text). */
  message?: string | false;
  /** Error toast text; `false` shows none (default: the translated "copy failed" text). */
  errorMessage?: string | false;
}

export async function copyToClipboard(text: string, document: Document | undefined = globalThis.document): Promise<boolean> {
  const view = document?.defaultView;
  if (!document || !view) {
    return false;
  }
  if (view.isSecureContext && view.navigator.clipboard?.writeText) {
    try {
      await view.navigator.clipboard.writeText(text);
      return true;
    } catch {
      return copyWithSelection(text, document);
    }
  }
  return copyWithSelection(text, document);
}

function copyWithSelection(text: string, document: Document): boolean {
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  area.style.pointerEvents = 'none';
  const active = document.activeElement as HTMLElement | null;
  document.body.appendChild(area);
  area.select();
  let copied = false;
  try {
    copied = document.execCommand('copy');
  } catch {
    copied = false;
  }
  document.body.removeChild(area);
  active?.focus?.({ preventScroll: true });
  return copied;
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
