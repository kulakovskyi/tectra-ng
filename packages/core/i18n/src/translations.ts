import { inject } from '@angular/core';
import { TECTRA_CONFIG, TxTranslations } from '@tectra/core/config';
import { DEFAULT_TRANSLATIONS } from './default-translations';

export function injectTranslations(): TxTranslations {
  const config = inject(TECTRA_CONFIG, { optional: true });
  return { ...DEFAULT_TRANSLATIONS, ...config?.translations };
}
