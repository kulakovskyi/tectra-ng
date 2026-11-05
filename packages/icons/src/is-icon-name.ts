import { TX_ICONS, TxIconName } from './icons';

export function isTxIconName(name: string | undefined): name is TxIconName {
  return !!name && name in TX_ICONS;
}
