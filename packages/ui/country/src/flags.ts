import { InjectionToken, Provider } from '@angular/core';
import { TxFlagResolver, TxFlagShape } from './country.types';

/** Injection token of the flag resolver that `tx-country` uses; set it with `provideTxFlags`. */
export const TX_FLAG_RESOLVER = new InjectionToken<TxFlagResolver>('TX_FLAG_RESOLVER');

/** Draws flags as images or CSS classes through the resolver instead of emoji; provide it once in the app. */
export function provideTxFlags(resolver: TxFlagResolver): Provider {
  return { provide: TX_FLAG_RESOLVER, useValue: resolver };
}

/**
 * Flag resolver for a flag stylesheet that is already on the page, using the classes `fi fi-ua` (and `fis` for circles).
 */
export const txFlagIcons: TxFlagResolver = (code, shape) => ({
  class: `fi fi-${code.toLowerCase()}${shape === 'circle' ? ' fis' : ''}`,
});

/**
 * Builds a flag resolver from a function that returns an image address for a lower-case code and a shape, now or as a promise.
 */
export function txFlagImages(url: (code: string, shape: TxFlagShape) => string | Promise<string | null>): TxFlagResolver {
  return (code, shape) => {
    const src = url(code.toLowerCase(), shape);
    return typeof src === 'string' ? { src } : src.then((value) => (value ? { src: value } : null));
  };
}
