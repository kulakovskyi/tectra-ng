import { Signal, inject } from '@angular/core';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxLocaleService } from './locale.service';

export function injectTranslations(): Signal<TxTranslations> {
  return inject(TxLocaleService).translations;
}
