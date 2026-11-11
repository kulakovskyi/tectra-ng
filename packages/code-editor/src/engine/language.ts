import { Facet } from '@codemirror/state';
import { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';

export const codeLanguage = Facet.define<TxCodeLanguage, TxCodeLanguage>({
  combine: (values) => values[0] ?? 'plain',
});
