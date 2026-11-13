/** Options of `TxValidators.url`. */
export interface TxUrlValidatorOptions {
  /** Allows `https` only (default `true`); `false` also allows `http`. */
  https?: boolean;
  /** Required host: a name that matches it or its subdomains, or a pattern for the host name. */
  host?: string | RegExp;
}

/** Options of `TxValidators.strongPassword`. */
export interface TxStrongPasswordOptions {
  /** Shortest password (default 6). */
  minLength?: number;
  /** Needs an uppercase letter (default `true`). */
  upper?: boolean;
  /** Needs a lowercase letter (default `true`). */
  lower?: boolean;
  /** Needs a digit (default `false`). */
  digit?: boolean;
  /** Needs a symbol that is not a letter, digit or space (default `true`). */
  symbol?: boolean;
}

/** Options of `TxValidators.ip`. */
export interface TxIpValidatorOptions {
  /** Needs a CIDR suffix such as `/24` on IPv4 (default `false`). */
  cidr?: boolean;
  /** Also accepts IPv6 addresses (default `false`). */
  ipv6?: boolean;
}

/** Options of `TxValidators.duplicate`. */
export interface TxDuplicateValidatorOptions {
  /** Own error text, or a function that returns it. */
  message?: string | (() => string);
  /** Tells `A` from `a` (default `false`). */
  caseSensitive?: boolean;
  /** Ignores spaces around the value (default `true`). */
  trim?: boolean;
}

/** Options of `TxValidators.cssSelector`. */
export interface TxCssSelectorValidatorOptions {
  /** Accepts a class selector like `.name` (default `true`). */
  allowClass?: boolean;
  /** Accepts an id selector like `#name` (default `true`). */
  allowId?: boolean;
}
