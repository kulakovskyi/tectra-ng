import { Type } from '@angular/core';

export interface DocApiMember {
  name: string;
  type: string;
  default: string;
  description: string;
}

export interface DocSlot {
  name: string;
  description: string;
}

export interface DocKeyboardRow {
  key: string;
  action: string;
}

export interface DocToken {
  name: string;
  value: string;
}

export interface DocExample {
  id: string;
  title: string;
  descriptionHtml: string;
  source: string;
  sourceHtml: string;
  load: () => Promise<Type<unknown>>;
}

export interface DocComponent {
  name: string;
  title: string;
  category: string;
  selector: string;
  importPath: string;
  descriptionHtml: string;
  api: { inputs: DocApiMember[]; outputs: DocApiMember[]; slots: DocSlot[] };
  keyboard: DocKeyboardRow[];
  tokens: DocToken[];
  examples: DocExample[];
}

export type DocTab = 'features' | 'api' | 'theming' | 'a11y';
