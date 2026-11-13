import { TX_ICONS, TxIconName } from './icons';

/** Whether a name is an icon of the tectra set (without the `pi-` prefix). */
export function isTxIconName(name: string | undefined): name is TxIconName {
  return !!name && name in TX_ICONS;
}
