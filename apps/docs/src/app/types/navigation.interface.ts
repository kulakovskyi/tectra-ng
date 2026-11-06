import { TxIconName } from '@tectra-ng/icons';

export interface DocNavLink {
  label: string;
  path: string;
}

export interface DocNavGroup {
  title: string;
  icon: TxIconName;
  links: DocNavLink[];
}

export interface DocNavSection {
  title?: string;
  groups: DocNavGroup[];
}
