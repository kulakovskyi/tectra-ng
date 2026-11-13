import { DOCUMENT, Injectable, inject } from '@angular/core';
import { TxPasswordGeneratorOptions } from './password-generator.types';

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/~';
const SIMILAR = /[0O1lI|]/g;

/**
 * Makes strong random passwords from `crypto.getRandomValues`, with at least one character of every
 * enabled set.
 */
@Injectable({ providedIn: 'root' })
export class TxPasswordGenerator {
  private crypto = inject(DOCUMENT).defaultView?.crypto ?? globalThis.crypto;

  /** Makes a password; throws when every character set is turned off. */
  generate(options: TxPasswordGeneratorOptions = {}): string {
    const sets = this.sets(options);
    if (!sets.length) {
      throw new Error('TxPasswordGenerator: enable at least one character set');
    }
    const length = Math.max(options.length ?? 16, sets.length);
    const all = sets.join('');
    const chars = sets.map((set) => set[this.randomIndex(set.length)]);
    while (chars.length < length) {
      chars.push(all[this.randomIndex(all.length)]);
    }
    for (let index = chars.length - 1; index > 0; index -= 1) {
      const swap = this.randomIndex(index + 1);
      [chars[index], chars[swap]] = [chars[swap], chars[index]];
    }
    return chars.join('');
  }

  /** Makes a password of the given length (default 16) with all character sets. */
  generatePassword(length = 16): string {
    return this.generate({ length });
  }

  private sets(options: TxPasswordGeneratorOptions): string[] {
    const clean = (set: string) => (options.excludeSimilar ? set.replace(SIMILAR, '') : set);
    return [
      options.lowercase !== false ? clean(LOWERCASE) : '',
      options.uppercase !== false ? clean(UPPERCASE) : '',
      options.digits !== false ? clean(DIGITS) : '',
      options.symbols !== false ? clean(options.symbolSet ?? SYMBOLS) : '',
    ].filter(Boolean);
  }

  private randomIndex(size: number): number {
    const limit = Math.floor(0x100000000 / size) * size;
    const buffer = new Uint32Array(1);
    do {
      this.crypto.getRandomValues(buffer);
    } while (buffer[0] >= limit);
    return buffer[0] % size;
  }
}
