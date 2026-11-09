import { DOCUMENT, Injectable, inject } from '@angular/core';
import { TxToastRef, TxToastService } from '@tectra-ng/ui/toast';

@Injectable({ providedIn: 'root' })
export class DocsClipboard {
  private readonly toast = inject(TxToastService);
  private readonly document = inject(DOCUMENT);
  private last?: TxToastRef;

  copy(text: string, message = 'Copied to the clipboard'): void {
    void this.document.defaultView?.navigator.clipboard?.writeText(text);
    this.last?.close();
    this.last = this.toast.success(message, { life: 2000 });
  }
}
