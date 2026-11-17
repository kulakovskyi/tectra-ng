import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { TECTRA_CONFIG } from './tectra-config.token';

/**
 * Remembers the chosen locale code in local storage under the `localeStorageKey` of the config. Without the key it
 * keeps nothing; on the server it reads and writes nothing.
 */
@Injectable({ providedIn: 'root' })
export class TxLocaleStorage {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly key = inject(TECTRA_CONFIG, { optional: true })?.localeStorageKey;

  /** The remembered locale code; `null` when nothing is kept, no key is set or on the server. */
  read(): string | null {
    const storage = this.storage();
    if (!storage || !this.key) {
      return null;
    }
    try {
      const code = storage.getItem(this.key);
      return code ? code : null;
    } catch {
      return null;
    }
  }

  /** Remembers a locale code; does nothing without a key or on the server. */
  write(code: string): void {
    const storage = this.storage();
    if (!storage || !this.key) {
      return;
    }
    try {
      storage.setItem(this.key, code);
    } catch {
      return;
    }
  }

  private storage(): Storage | null {
    if (!this.browser) {
      return null;
    }
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }
}
