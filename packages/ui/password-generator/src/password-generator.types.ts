export interface TxPasswordGeneratorOptions {
  length?: number;
  lowercase?: boolean;
  uppercase?: boolean;
  digits?: boolean;
  symbols?: boolean;
  symbolSet?: string;
  excludeSimilar?: boolean;
}
