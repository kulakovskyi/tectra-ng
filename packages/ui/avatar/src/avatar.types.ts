/** Named size of an avatar; `size` also accepts a number in px. */
export type TxAvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
/** Outline of an avatar: `circle` or `square`. */
export type TxAvatarShape = 'circle' | 'square';
/** Background colour of an avatar with initials: a tinted tone, or `solid` (the primary colour). */
export type TxAvatarTone = 'blue' | 'green' | 'sky' | 'orange' | 'purple' | 'red' | 'solid';
/** Name hint of an avatar: `true` the kit tooltip, `false` the native title, `none` no hint at all. */
export type TxAvatarTooltip = boolean | 'none';
/** App-wide settings of every `tx-avatar`; set them with `provideTxAvatar`. */
export interface TxAvatarOptions {
  /** Turns a name into initials; `avatarInitials` (first letters of the first and the last word) by default. */
  initials?: (name: string) => string;
  /** Photo addresses (exact text or a pattern) that are blank placeholders: such an avatar shows initials instead. */
  placeholderImages?: readonly (string | RegExp)[];
  /** One tone for every avatar with initials instead of the one picked from the name; `tone` of an avatar still wins. */
  tone?: TxAvatarTone;
}
/** Names of the parts of `tx-avatar` that `pt` can style. */
export type TxAvatarPart = 'root' | 'image' | 'label' | 'icon';
/** Names of the parts of `tx-avatar-group` that `pt` can style. */
export type TxAvatarGroupPart = 'root' | 'more' | 'add' | 'list' | 'item' | 'name';
/** Names of the parts of `tx-avatar-editor` that `pt` can style. */
export type TxAvatarEditorPart = 'root' | 'photo' | 'badge' | 'loader' | 'hint';
/** Why the editor refused a file: `type` is not accepted, `size` is over the limit. */
export type TxAvatarEditorRejectReason = 'type' | 'size';

/** A file the editor refused and why. */
export interface TxAvatarEditorRejection {
  /** The refused file. */
  readonly file: File;
  /** Why it was refused. */
  readonly reason: TxAvatarEditorRejectReason;
}
