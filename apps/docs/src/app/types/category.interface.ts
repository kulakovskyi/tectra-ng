import { TxIconName } from '@tectra-ng/icons';

export interface DocCategoryText {
  heading: string;
  title: string;
  intro: string;
}

export interface DocCategoryComponent {
  name: string;
  title: string;
  summary: string;
}

export interface DocCategory extends DocCategoryText {
  name: string;
  slug: string;
  path: string;
  icon: TxIconName;
  description: string;
  components: DocCategoryComponent[];
}
