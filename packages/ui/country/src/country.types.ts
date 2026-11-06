export type TxCountrySize = 'small' | 'medium' | 'large';
export type TxFlagShape = 'rectangle' | 'circle';
export type TxCountryPart = 'root' | 'flag' | 'name';

export interface TxFlag {
  class?: string;
  src?: string;
}

export type TxFlagResolver = (code: string, shape: TxFlagShape) => TxFlag | Promise<TxFlag | null> | null;
