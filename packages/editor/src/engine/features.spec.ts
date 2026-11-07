import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { matchEmoji } from '../editor.emoji';
import { TX_EDITOR_SLASH_ITEMS, matchSlashItems } from '../editor.slash';
import { wrapIn } from './commands';
import { parseHtml, serializeHtml } from './html';
import { findSuggestion } from './plugins';
import { editorPlugins } from './setup';
import { txEditorSchema as schema } from './schema';
import { addColumn, addRow, deleteColumn, deleteRow, deleteTable, goToCell, insertTable, toggleHeaderRow } from './tables';
import { Command } from 'prosemirror-state';

const options = (typography = true) => ({
  placeholder: () => '',
  maxLength: () => undefined,
  linkTarget: () => '_blank',
  triggers: () => [],
  suggestion: { change: () => undefined, keydown: () => false },
  openLink: () => undefined,
  typography: { enabled: () => typography, quotes: () => ['«', '»', '„', '“'] as const },
});

function stateOf(html: string, cursor = 1): EditorState {
  const state = EditorState.create({ schema, doc: parseHtml(html, document), plugins: editorPlugins(options()) });
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, cursor)));
}

function run(state: EditorState, command: Command): EditorState {
  let next = state;
  command(state, (tr) => (next = state.apply(tr)));
  return next;
}

const html = (state: EditorState) => serializeHtml(state.doc, document).replace(/;"/g, '"');
const cells = (state: EditorState) => {
  const rows: string[] = [];
  state.doc.descendants((node) => {
    if (node.type.name === 'table_row') {
      const row: string[] = [];
      node.forEach((cell) => row.push(`${cell.type.name === 'table_header' ? 'h' : 'c'}:${cell.textContent}`));
      rows.push(row.join(','));
      return false;
    }
    return true;
  });
  return rows;
};

describe('tables', () => {
  it('inserts a table with a header row and edits rows and columns', () => {
    let state = run(stateOf('<p></p>'), insertTable);
    expect(cells(state)).toEqual(['h:,h:,h:', 'c:,c:,c:', 'c:,c:,c:']);
    state = state.apply(state.tr.insertText('A'));
    state = run(state, goToCell(1));
    state = state.apply(state.tr.insertText('B'));
    expect(cells(state)[0]).toBe('h:A,h:B,h:');
    state = run(state, addColumn(true));
    expect(cells(state)[0]).toBe('h:A,h:B,h:,h:');
    state = run(state, addRow(true));
    expect(cells(state)).toHaveLength(4);
    expect(cells(state)[1]).toBe('c:,c:,c:,c:');
    state = run(state, deleteRow);
    expect(cells(state)).toHaveLength(3);
    state = run(state, deleteColumn);
    expect(cells(state)[0].split(',')).toHaveLength(3);
    state = run(state, toggleHeaderRow);
    expect(cells(state)[0].startsWith('c:')).toBe(true);
    state = run(state, deleteTable);
    expect(html(state)).not.toContain('<table');
  });

  it('adds a row when Tab leaves the last cell and parses pasted tables', () => {
    let state = stateOf('<table><tbody><tr><td>One</td><td style="width: 120px">Two</td></tr></tbody></table>', 3);
    expect(html(state)).toBe('<table><tbody><tr><td><p>One</p></td><td data-colwidth="120" style="width: 120px"><p>Two</p></td></tr></tbody></table>');
    state = run(state, goToCell(1));
    state = run(state, goToCell(1));
    expect(cells(state)).toEqual(['c:One,c:Two', 'c:,c:']);
  });
});

describe('callouts', () => {
  it('wraps blocks and keeps the tone', () => {
    const state = run(stateOf('<p>Note</p>'), wrapIn(schema.nodes['callout'], { tone: 'warn' }));
    expect(html(state)).toBe('<div data-type="callout" data-tone="warn"><p>Note</p></div>');
    expect(html(stateOf('<div data-type="callout" data-tone="nope"><p>x</p></div>'))).toBe('<div data-type="callout" data-tone="info"><p>x</p></div>');
  });
});

describe('typography and suggestions', () => {
  let view: EditorView;
  const type = (text: string) => {
    for (const char of text) {
      const { from, to } = view.state.selection;
      const handled = view.someProp('handleTextInput', (handler) => handler(view, from, to, char, () => view.state.tr.insertText(char, from, to)));
      if (!handled) {
        view.dispatch(view.state.tr.insertText(char, from, to));
      }
    }
  };
  const press = (key: string) => view.someProp('handleKeyDown', (handler) => handler(view, new KeyboardEvent('keydown', { key, code: key })));

  beforeEach(() => {
    view = new EditorView(document.createElement('div'), { state: stateOf('<p></p>') });
  });

  afterEach(() => view.destroy());

  it('replaces dashes, arrows, ellipses and quotes, and Backspace undoes the last one', () => {
    type('wait... "quoted" it\'s a -> b -- c (c)');
    expect(view.state.doc.textContent).toBe('wait… «quoted» it’s a → b — c ©');
    press('Backspace');
    expect(view.state.doc.textContent).toBe('wait… «quoted» it’s a → b — c (c)');
  });

  it('finds the trigger before the cursor', () => {
    type('Hi @an and /tab');
    const triggers = [
      { kind: 'mention' as const, char: '@', minLength: 0 },
      { kind: 'slash' as const, char: '/', minLength: 0 },
      { kind: 'emoji' as const, char: ':', minLength: 2 },
    ];
    expect(findSuggestion(view.state, triggers)).toMatchObject({ kind: 'slash', query: 'tab' });
    type(' :f');
    expect(findSuggestion(view.state, triggers)).toBeNull();
    type('i');
    expect(findSuggestion(view.state, triggers)).toMatchObject({ kind: 'emoji', query: 'fi' });
    type(' https://a/b');
    expect(findSuggestion(view.state, triggers)).toBeNull();
  });

  it('ranks slash commands and emoji', () => {
    const label = (item: (typeof TX_EDITOR_SLASH_ITEMS)[number]) => item.id;
    expect(matchSlashItems(TX_EDITOR_SLASH_ITEMS, 'tab', label)[0].id).toBe('table');
    expect(matchSlashItems(TX_EDITOR_SLASH_ITEMS, 'список', label).map((item) => item.id)).toEqual(['bulletList', 'orderedList']);
    expect(matchSlashItems(TX_EDITOR_SLASH_ITEMS, '', label)).toHaveLength(TX_EDITOR_SLASH_ITEMS.length);
    expect(matchEmoji('fir')[0].char).toBe('🔥');
    expect(matchEmoji('+1')[0].char).toBe('👍');
  });
});
