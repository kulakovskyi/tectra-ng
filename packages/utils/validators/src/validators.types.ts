export interface TxUrlValidatorOptions {
  https?: boolean;
  host?: string | RegExp;
}

export interface TxStrongPasswordOptions {
  minLength?: number;
  upper?: boolean;
  lower?: boolean;
  digit?: boolean;
  symbol?: boolean;
}

export interface TxIpValidatorOptions {
  cidr?: boolean;
  ipv6?: boolean;
}

export interface TxDuplicateValidatorOptions {
  message?: string | (() => string);
  caseSensitive?: boolean;
  trim?: boolean;
}

export interface TxCssSelectorValidatorOptions {
  allowClass?: boolean;
  allowId?: boolean;
}
