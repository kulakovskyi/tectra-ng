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

export interface DocCodeFold {
  before: string;
  inner: string;
  after: string;
  lines: number;
  indent: number;
  resumeAt: number;
}

export interface DocCodeFile {
  label: string;
  source: string;
  html: string;
  fold: DocCodeFold | null;
}

export interface DocExample {
  id: string;
  title: string;
  descriptionHtml: string;
  files: DocCodeFile[];
  load: () => Promise<Type<unknown>>;
}

export interface DocComponent {
  name: string;
  title: string;
  category: string;
  selector: string;
  importPath: string;
  importName: string;
  descriptionHtml: string;
  api: { inputs: DocApiMember[]; outputs: DocApiMember[]; slots: DocSlot[] };
  keyboard: DocKeyboardRow[];
  tokens: DocToken[];
  examples: DocExample[];
}

export interface DocComponentEntry {
  name: string;
  title: string;
  category: string;
  load: () => Promise<DocComponent>;
}

export type DocTab = 'features' | 'api' | 'theming' | 'a11y';
