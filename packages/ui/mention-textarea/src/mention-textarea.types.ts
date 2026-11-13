import { TxSelectPart } from '@tectra-ng/ui/select';

/** One suggestion of `tx-mention-textarea`: who or what can be mentioned. */
export interface TxMentionItem {
  /** Text inserted after the trigger and shown in the list. */
  label: string;
  /** Stable identifier reported in `mentionsChange`. */
  value: string;
  /** Address of an image shown before the label, such as an avatar. */
  image?: string;
  /** Second line under the label in the list. */
  description?: string;
}

/** Parts of `tx-mention-textarea` that `pt` can style. */
export type TxMentionTextareaPart = 'root' | 'textarea' | Extract<TxSelectPart, 'panel' | 'list' | 'option' | 'empty'>;

/** Event of `searched`: the user is typing a mention. */
export interface TxMentionSearchEvent {
  /** Text typed after the trigger. */
  query: string;
}
