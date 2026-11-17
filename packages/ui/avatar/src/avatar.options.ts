import { InjectionToken, Provider } from '@angular/core';
import { TxAvatarOptions } from './avatar.types';

/** App-wide settings of every `tx-avatar`; set them with `provideTxAvatar`. */
export const TX_AVATAR_OPTIONS = new InjectionToken<TxAvatarOptions>('TX_AVATAR_OPTIONS');

/**
 * Sets app-wide settings of every `tx-avatar`: the initials rule, placeholder photos that show initials and one tone,
 * e.g. `provideTxAvatar({ placeholderImages: ['/assets/blank.png'], tone: 'solid' })`.
 */
export function provideTxAvatar(options: TxAvatarOptions): Provider {
  return { provide: TX_AVATAR_OPTIONS, useValue: options };
}

/**
 * Initials of a name: the first letters of its first and last words, upper case (`Olena Kovalenko` → `OK`, `admin` → `A`);
 * words are split by spaces, dots, underscores, `@` and dashes.
 */
export function avatarInitials(name: string): string {
  const words = name.trim().split(/[\s._@-]+/).filter(Boolean);
  if (!words.length) {
    return '';
  }
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : '';
  return (first + last).toUpperCase();
}
