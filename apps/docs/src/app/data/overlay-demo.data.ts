import { TxPlacement } from '@tectra/core/overlay';

export const OVERLAY_DEMO_ROWS: (TxPlacement | null)[][] = [
  [null, 'top-start', 'top', 'top-end', null],
  ['left-start', null, null, null, 'right-start'],
  ['left', null, null, null, 'right'],
  ['left-end', null, null, null, 'right-end'],
  [null, 'bottom-start', 'bottom', 'bottom-end', null],
];
