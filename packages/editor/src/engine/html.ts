import { DOMParser as ProseDOMParser, DOMSerializer, Node as ProseNode } from 'prosemirror-model';
import { fromQuillHtml } from '@tectra-ng/editor/content';
import { txEditorSchema as schema } from './schema';

export function parseHtml(html: string | null | undefined, document: Document): ProseNode {
  const inert = document.implementation.createHTMLDocument('');
  const container = inert.createElement('div');
  container.innerHTML = fromQuillHtml(html ?? '');
  return ProseDOMParser.fromSchema(schema).parse(container, { preserveWhitespace: false });
}

export function serializeHtml(doc: ProseNode, document: Document): string {
  if (isEmptyDoc(doc)) {
    return '';
  }
  const container = document.createElement('div');
  container.appendChild(DOMSerializer.fromSchema(schema).serializeFragment(doc.content, { document }));
  return container.innerHTML;
}

export function isEmptyDoc(doc: ProseNode): boolean {
  const only = doc.childCount === 1 ? doc.firstChild : null;
  return !!only && only.type.name === 'paragraph' && only.content.size === 0 && !only.attrs['align'] && !only.attrs['indent'];
}
