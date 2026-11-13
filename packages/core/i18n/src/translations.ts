import { Signal, inject } from '@angular/core';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxLocaleService } from './locale.service';

/** Returns the translations of the current locale as a signal; call it in an injection context. */
export function injectTranslations(): Signal<TxTranslations> {
  return inject(TxLocaleService).translations;
}
