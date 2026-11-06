import { InjectionToken, Provider } from '@angular/core';
import { TxFlagResolver, TxFlagShape } from './country.types';

export const TX_FLAG_RESOLVER = new InjectionToken<TxFlagResolver>('TX_FLAG_RESOLVER');

export function provideTxFlags(resolver: TxFlagResolver): Provider {
  return { provide: TX_FLAG_RESOLVER, useValue: resolver };
}

export const txFlagIcons: TxFlagResolver = (code, shape) => ({
  class: `fi fi-${code.toLowerCase()}${shape === 'circle' ? ' fis' : ''}`,
});

export function txFlagImages(url: (code: string, shape: TxFlagShape) => string | Promise<string | null>): TxFlagResolver {
  return (code, shape) => {
    const src = url(code.toLowerCase(), shape);
    return typeof src === 'string' ? { src } : src.then((value) => (value ? { src: value } : null));
  };
}
