/** Direction of the panels: `horizontal` (side by side) or `vertical` (stacked). */
export type TxSplitterLayout = 'horizontal' | 'vertical';

/** Browser storage that keeps the panel sizes: `session` or `local`. */
export type TxSplitterStateStorage = 'session' | 'local';

/** Parts of `tx-splitter` that `pt` can style. */
export type TxSplitterPart = 'root' | 'panel' | 'gutter' | 'handle';

/** Payload of the splitter resize events: the DOM event and the panel sizes. */
export interface TxSplitterResizeEvent {
  /** The pointer or key event behind the resize. */
  originalEvent: Event;
  /** Sizes of all panels, in percent. */
  sizes: number[];
}

/** Payload of the event fired when a collapsible panel snaps shut or opens. */
export interface TxSplitterCollapseEvent {
  /** Index of the panel. */
  index: number;
  /** `true` when the panel is now shut. */
  collapsed: boolean;
  /** Sizes of all panels, in percent. */
  sizes: number[];
}

/** Resize limits of one panel, in percent. */
export interface TxSplitterPanelLimits {
  /** Smallest size of the open panel. */
  minSize: number;
  /** Largest size of the panel. */
  maxSize: number;
  /** Whether the panel snaps shut when dragged below `minSize`. */
  collapsible: boolean;
  /** Size of the panel while shut. */
  collapsedSize: number;
}

/** Sizes and collapsed flags of all panels of a splitter. */
export interface TxSplitterLayoutState {
  /** Sizes of the panels, in percent. */
  sizes: number[];
  /** Whether each panel is shut. */
  collapsed: boolean[];
}
