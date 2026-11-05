import { InjectionToken, Signal } from '@angular/core';
import { TxAvatarShape, TxAvatarSize } from './avatar.types';

export interface TxAvatarGroupContext {
  readonly size: Signal<TxAvatarSize | number | undefined>;
  readonly shape: Signal<TxAvatarShape | undefined>;
  isHidden(avatar: object): boolean;
}

export const TX_AVATAR_GROUP = new InjectionToken<TxAvatarGroupContext>('TX_AVATAR_GROUP');
