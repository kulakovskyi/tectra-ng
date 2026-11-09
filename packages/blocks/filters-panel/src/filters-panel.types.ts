export type TxFiltersPanelVariant = 'card' | 'plain';

export type TxFiltersPanelCollapse = 'auto' | 'always' | 'never';

export type TxFiltersPanelStateStorage = 'local' | 'session';

export type TxFiltersPanelPart = 'root' | 'toggle' | 'panel' | 'fields' | 'actions' | 'menuButton' | 'menu';

export interface TxFiltersPanelOption {
  key: string;
  label: string;
  visible: boolean;
  active: boolean;
}

export interface TxFiltersPanelLayout {
  order: string[];
  visible: string[] | null;
}
