import { EnvironmentProviders } from '@angular/core';
import { provideTxIcons } from '@tectra/icons';
import { TX_BRAND_ICONS } from './brand-icons';

export function provideTxBrandIcons(): EnvironmentProviders {
  return provideTxIcons(TX_BRAND_ICONS);
}
