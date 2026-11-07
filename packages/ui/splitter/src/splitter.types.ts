export type TxSplitterLayout = 'horizontal' | 'vertical';

export type TxSplitterStateStorage = 'session' | 'local';

export type TxSplitterPart = 'root' | 'panel' | 'gutter' | 'handle';

export interface TxSplitterResizeEvent {
  originalEvent: Event;
  sizes: number[];
}

export interface TxSplitterCollapseEvent {
  index: number;
  collapsed: boolean;
  sizes: number[];
}

export interface TxSplitterPanelLimits {
  minSize: number;
  maxSize: number;
  collapsible: boolean;
  collapsedSize: number;
}

export interface TxSplitterLayoutState {
  sizes: number[];
  collapsed: boolean[];
}
