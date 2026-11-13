/** Named size of an avatar; `size` also accepts a number in px. */
export type TxAvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
/** Outline of an avatar: `circle` or `square`. */
export type TxAvatarShape = 'circle' | 'square';
/** Background colour of an avatar with initials. */
export type TxAvatarTone = 'blue' | 'green' | 'sky' | 'orange' | 'purple' | 'red';
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
