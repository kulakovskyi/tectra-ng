/** Frame of `tx-filters-panel`: `card` with its own frame or `plain` without. */
export type TxFiltersPanelVariant = 'card' | 'plain';

/** When the fields fold behind the "Filters" button: `auto` below 1024px, `always` or `never`. */
export type TxFiltersPanelCollapse = 'auto' | 'always' | 'never';

/** Where the saved layout lives: `local` or `session` storage. */
export type TxFiltersPanelStateStorage = 'local' | 'session';

/** Names of the parts of `tx-filters-panel` that its `pt` input can style. */
export type TxFiltersPanelPart = 'root' | 'toggle' | 'panel' | 'fields' | 'actions' | 'menuButton' | 'menu';

/** One field of the panel as the "Show filters" menu lists it. */
export interface TxFiltersPanelOption {
  /** Key of the field, from `txFilterField`. */
  key: string;
  /** Text of the field in the menu, from `filterLabel`. */
  label: string;
  /** Whether the field is shown in the panel. */
  visible: boolean;
  /** Whether the field has a value, from `filterActive`. */
  active: boolean;
}

/** Saved layout of the panel: the order of the fields and which of them are shown. */
export interface TxFiltersPanelLayout {
  /** Field keys in the order they are shown. */
  order: string[];
  /** Keys of the shown fields; `null` means the default set. */
  visible: string[] | null;
}
