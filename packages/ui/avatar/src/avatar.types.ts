export type TxAvatarSize = 'small' | 'medium' | 'large' | 'xlarge';
export type TxAvatarShape = 'circle' | 'square';
export type TxAvatarTone = 'blue' | 'green' | 'sky' | 'orange' | 'purple' | 'red';
export type TxAvatarPart = 'root' | 'image' | 'label' | 'icon';
export type TxAvatarGroupPart = 'root' | 'more' | 'add' | 'list' | 'item' | 'name';
export type TxAvatarEditorPart = 'root' | 'photo' | 'badge' | 'loader' | 'hint';
export type TxAvatarEditorRejectReason = 'type' | 'size';

export interface TxAvatarEditorRejection {
  readonly file: File;
  readonly reason: TxAvatarEditorRejectReason;
}
