import { EditorSelection, EditorState, StateCommand, Transaction } from '@codemirror/state';
import { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';
import { matchBracket } from './brackets';
import {
  copyLineDown,
  deleteLine,
  detectTabSize,
  indentLess,
  indentMore,
  insertNewline,
  insertTab,
  moveLineDown,
  moveLineUp,
  smartBackspace,
  toggleComment,
} from './commands';
import { historyField, redo, undo } from './history';
import { codeLanguage } from './language';
import { findMatches, replacementFor } from './search';

function create(text: string, language: TxCodeLanguage = 'javascript', tabSize = 2): EditorState {
  const cursor = text.indexOf('|');
  const doc = cursor < 0 ? text : text.replace('|', '');
  return EditorState.create({
    doc,
    selection: EditorSelection.cursor(Math.max(cursor, 0)),
    extensions: [historyField, codeLanguage.of(language), EditorState.tabSize.of(tabSize), EditorState.allowMultipleSelections.of(true)],
  });
}

function run(state: EditorState, command: StateCommand): EditorState {
  let next = state;
  command({ state, dispatch: (transaction: Transaction) => (next = transaction.state) });
  return next;
}

function show(state: EditorState): string {
  const head = state.selection.main.head;
  const doc = state.doc.toString();
  return doc.slice(0, head) + '|' + doc.slice(head);
}

describe('editing commands', () => {
  it('keeps the indent on Enter and adds one after an opening bracket', () => {
    expect(show(run(create('  a|'), insertNewline))).toBe('  a\n  |');
    expect(show(run(create('if (a) {|}'), insertNewline))).toBe('if (a) {\n  |\n}');
    expect(show(run(create('<div>|</div>', 'html'), insertNewline))).toBe('<div>\n  |\n</div>');
    expect(show(run(create('<br>|', 'html'), insertNewline))).toBe('<br>\n|');
  });

  it('indents with Tab and outdents with Shift+Tab', () => {
    expect(show(run(create('a|'), insertTab))).toBe('a |');
    const selected = create('a\nb').update({ selection: EditorSelection.range(0, 3) }).state;
    expect(run(selected, indentMore).doc.toString()).toBe('  a\n  b');
    expect(run(create('    a|'), indentLess).doc.toString()).toBe('  a');
  });

  it('deletes a pair and a whole indent with Backspace', () => {
    expect(show(run(create('(|)'), smartBackspace))).toBe('|');
    expect(show(run(create('    |a'), smartBackspace))).toBe('  |a');
    expect(run(create('ab|'), smartBackspace).doc.toString()).toBe('ab');
  });

  it('comments lines with the language comment', () => {
    const commented = run(create('|let a;\nlet b;').update({ selection: EditorSelection.range(0, 13) }).state, toggleComment);
    expect(commented.doc.toString()).toBe('// let a;\n// let b;');
    expect(run(commented.update({ selection: EditorSelection.range(0, commented.doc.length) }).state, toggleComment).doc.toString()).toBe('let a;\nlet b;');
    const html = run(create('  <p>Hi</p>|', 'html'), toggleComment);
    expect(html.doc.toString()).toBe('  <!-- <p>Hi</p> -->');
    expect(run(html, toggleComment).doc.toString()).toBe('  <p>Hi</p>');
  });

  it('moves, copies and deletes lines', () => {
    expect(run(create('a\nb|'), moveLineUp).doc.toString()).toBe('b\na');
    expect(show(run(create('a|\nb'), moveLineDown))).toBe('b\na|');
    expect(run(create('a|\nb'), copyLineDown).doc.toString()).toBe('a\na\nb');
    expect(run(create('a\nb|\nc'), deleteLine).doc.toString()).toBe('a\nc');
  });

  it('does nothing in a read-only editor', () => {
    const state = EditorState.create({ doc: 'a', extensions: [EditorState.readOnly.of(true)] });
    expect(insertTab({ state, dispatch: () => undefined })).toBe(false);
  });

  it('finds the indent size of a text', () => {
    expect(detectTabSize('a\n  b\n    c\n  d')).toBe(2);
    expect(detectTabSize('a\n    b\n        c')).toBe(4);
    expect(detectTabSize('a\n\tb')).toBe(4);
  });
});

describe('history', () => {
  it('undoes and redoes, grouping quick typing', () => {
    let state = create('|');
    state = state.update({ changes: { from: 0, insert: 'a' }, userEvent: 'input.type' }).state;
    state = state.update({ changes: { from: 1, insert: 'b' }, userEvent: 'input.type' }).state;
    state = state.update({ changes: { from: 2, insert: '\n' }, userEvent: 'input' }).state;
    state = run(state, undo);
    expect(state.doc.toString()).toBe('ab');
    state = run(state, undo);
    expect(state.doc.toString()).toBe('');
    expect(run(state, undo)).toBe(state);
    state = run(state, redo);
    expect(state.doc.toString()).toBe('ab');
  });
});

describe('search', () => {
  it('finds plain text, whole words and regular expressions', () => {
    const text = 'Color color colors';
    expect(findMatches(text, { text: 'color', matchCase: false, wholeWord: false, regexp: false }).matches).toHaveLength(3);
    expect(findMatches(text, { text: 'color', matchCase: true, wholeWord: true, regexp: false }).matches).toEqual([{ from: 6, to: 11 }]);
    expect(findMatches(text, { text: 'colou?rs?', matchCase: false, wholeWord: false, regexp: true }).matches).toHaveLength(3);
    expect(findMatches(text, { text: '(', matchCase: false, wholeWord: false, regexp: true }).valid).toBe(false);
  });

  it('builds the replacement with groups', () => {
    const state = create('width: 10px');
    const query = { text: '(\\d+)px', matchCase: false, wholeWord: false, regexp: true };
    const [match] = findMatches(state.doc.toString(), query).matches;
    expect(replacementFor(state, match, query, '$1rem')).toBe('10rem');
  });
});

describe('brackets', () => {
  it('finds the matching bracket both ways', () => {
    const state = create('f(a[1], {b})');
    expect(matchBracket(state, 1)).toEqual([1, 11]);
    expect(matchBracket(state, 11)).toEqual([1, 11]);
    expect(matchBracket(state, 0)).toBeNull();
  });
});
