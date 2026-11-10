export type TxListInputType = 'domain' | 'email' | 'url' | 'text';
export type TxListInputParser = (token: string) => string | null;
export type TxListInputPart = 'root' | 'field' | 'footer' | 'stats' | 'actions' | 'invalid';

export interface TxListInputResult {
  items: string[];
  invalid: string[];
  duplicates: number;
}
