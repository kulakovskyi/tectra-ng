/** Names of the parts of `tx-cascade-select` that `pt` can style. */
export type TxCascadeSelectPart = 'root' | 'box' | 'trigger' | 'value' | 'clear' | 'dropdown' | 'panel' | 'column' | 'option' | 'empty';

/** One row of a column of `tx-cascade-select`: an option or a group with its state. */
export interface TxCascadeItem {
  /** Element id of the row, unique in the tree. */
  id: string;
  /** Text of the row. */
  label: string;
  /** Value of the option; `null` for a group. */
  value: unknown;
  /** The source option or group object. */
  option: unknown;
  /** Depth of the column, 0 for the first. */
  level: number;
  /** Position of the row in its column. */
  index: number;
  /** Whether the row opens a next column. */
  group: boolean;
  /** Whether the row cannot be picked. */
  disabled: boolean;
  /** Whether this option is the current value. */
  selected: boolean;
  /** Whether the row is on the path of opened groups. */
  onPath: boolean;
}

/** Payload of `changed`: the picked option and the groups above it. */
export interface TxCascadeSelectChangeEvent {
  /** The new value; `null` when cleared. */
  value: unknown;
  /** The picked option object; `null` when cleared. */
  option: unknown;
  /** The groups and the option that lead to the pick, from the top. */
  path: unknown[];
}
