export type TxScrollPanelPart = 'root' | 'content' | 'barX' | 'barY';

export type TxScrollPanelAxis = 'x' | 'y';

export interface TxScrollPanelBar {
  visible: boolean;
  length: number;
  offset: number;
  value: number;
}
