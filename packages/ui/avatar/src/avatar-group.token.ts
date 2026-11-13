import { InjectionToken, Signal } from '@angular/core';
import { TxAvatarShape, TxAvatarSize } from './avatar.types';

/** What an avatar needs from its `tx-avatar-group`. */
export interface TxAvatarGroupContext {
  /** Size the group gives to its avatars. */
  readonly size: Signal<TxAvatarSize | number | undefined>;
  /** Shape the group gives to its avatars. */
  readonly shape: Signal<TxAvatarShape | undefined>;
  /** Whether avatars show their name in a tooltip. */
  readonly tooltips: Signal<boolean>;
  /** Tells whether the avatar is folded into the `+N` button. */
  isHidden(avatar: object): boolean;
}

/** Lets an avatar read the size, shape and tooltip settings of the `tx-avatar-group` around it. */
export const TX_AVATAR_GROUP = new InjectionToken<TxAvatarGroupContext>('TX_AVATAR_GROUP');
