import { EditorSelection, EditorState, Extension, StateCommand, Transaction } from '@codemirror/state';
import { Decoration, EditorView } from '@codemirror/view';
import { TxCodeLanguage } from '@tectra-ng/code-editor/highlight';
import { bracketMatching, matchBracket } from './brackets';
import {
  autoClose,
  copyLineDown,
  copyLineUp,
  deleteLine,
  detectTabSize,
  indentLess,
  indentMore,
  insertNewline,
  insertTab,
  isHistoryTransaction,
  moveLineDown,
  moveLineUp,
  selectAll,
  smartBackspace,
  toggleComment,
} from './commands';
import { syntaxHighlight } from './highlight';
import { historyAction, historyDepth, historyField, redo, undo } from './history';
import { indentGuides } from './indent-guides';
import { codeLanguage } from './language';
import { findMatches, replacementFor, searchMarks, searchPattern, setSearchMarks } from './search';
import { TX_CODE_EDITING_KEYS, TxCodeEditorCompartments, codeEditorBase, tabKeys } from './setup';
import { wrapIndent } from './wrap-indent';

function stubLayout(): void {
  const rect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect;
  const list = Object.assign([rect], { item: () => rect }) as unknown as DOMRectList;
  Range.prototype.getClientRects ??= () => list;
  Range.prototype.getBoundingClientRect ??= () => rect;
}

function create(text: string, language: TxCodeLanguage = 'javascript', tabSize = 2, extra: Extension = []): EditorState {
  const cursor = text.indexOf('|');
  const doc = cursor < 0 ? text : text.slice(0, cursor) + text.slice(cursor + 1);
  return EditorState.create({
    doc,
    selection: EditorSelection.cursor(Math.max(cursor, 0)),
    extensions: [historyField, codeLanguage.of(language), EditorState.tabSize.of(tabSize), EditorState.allowMultipleSelections.of(true), extra],
  });
}

function select(state: EditorState, ...ranges: [number, number][]): EditorState {
  return state.update({ selection: EditorSelection.create(ranges.map(([anchor, head]) => EditorSelection.range(anchor, head))) }).state;
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

const views: EditorView[] = [];

function mount(state: EditorState): EditorView {
  const parent = document.createElement('div');
  document.body.appendChild(parent);
  const view = new EditorView({ parent, state });
  views.push(view);
  return view;
}

function type(view: EditorView, text: string): boolean {
  const { from, to } = view.state.selection.main;
  const handler = view.state.facet(EditorView.inputHandler)[0];
  const handled = handler(view, from, to, text, () => view.state.update({ changes: { from, to, insert: text } }));
  if (!handled) {
    view.dispatch({ changes: { from, to, insert: text }, selection: EditorSelection.cursor(from + text.length) });
  }
  return handled;
}

function typing(text: string, input: string, language: TxCodeLanguage = 'javascript', extra: Extension = []): { handled: boolean; result: string } {
  const view = mount(create(text, language, 2, [autoClose, extra]));
  const handled = type(view, input);
  return { handled, result: show(view.state) };
}

describe('editing commands in detail', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  it('indents every touched line once and skips empty lines of a multi-cursor selection', () => {
    expect(run(select(create('a\nb'), [0, 2]), indentMore).doc.toString()).toBe('  a\nb');
    expect(run(select(create('a\n\nb'), [0, 0], [2, 2], [3, 3]), indentMore).doc.toString()).toBe('  a\n\n  b');
    expect(run(select(create('a\nb'), [0, 1], [0, 1]), indentMore).doc.toString()).toBe('  a\nb');
    expect(run(create('|'), indentMore).doc.toString()).toBe('  ');
  });

  it('outdents tabs, partial indents and leaves unindented lines', () => {
    expect(run(create('\ta|'), indentLess).doc.toString()).toBe('a');
    expect(run(create('   a|'), indentLess).doc.toString()).toBe('  a');
    const flat = create('a|');
    expect(run(flat, indentLess)).toBe(flat);
    expect(run(select(create('a\n    b'), [0, 7]), indentLess).doc.toString()).toBe('a\n  b');
  });

  it('indents the selection with Tab and pads to the next tab stop', () => {
    expect(run(select(create('a\nb'), [0, 3]), insertTab).doc.toString()).toBe('  a\n  b');
    expect(show(run(create('abc|', 'javascript', 4), insertTab))).toBe('abc |');
  });

  it('opens a block on Enter without a closing bracket after the cursor', () => {
    expect(show(run(create('if (a) {|'), insertNewline))).toBe('if (a) {\n  |');
    expect(show(run(create('  [|  ]'), insertNewline))).toBe('  [\n    |\n  ]');
    expect(show(run(create('<img src="x">|', 'html'), insertNewline))).toBe('<img src="x">\n|');
    expect(show(run(create('<a />|', 'html'), insertNewline))).toBe('<a />\n|');
    expect(show(run(create('<p>|</p>', 'markdown'), insertNewline))).toBe('<p>\n  |\n</p>');
    expect(show(run(create('<p>|</p>', 'javascript'), insertNewline))).toBe('<p>\n|</p>');
    expect(show(run(create('<p>text|', 'html'), insertNewline))).toBe('<p>text\n|');
  });

  it('leaves Backspace to the default command for a selection or a plain character', () => {
    const selected = select(create('ab'), [0, 2]);
    expect(smartBackspace({ state: selected, dispatch: () => undefined })).toBe(false);
    expect(show(run(create('  (|)'), smartBackspace))).toBe('  |');
    expect(show(run(create('   |'), smartBackspace))).toBe('  |');
    expect(show(run(create('|a'), smartBackspace))).toBe('|a');
  });

  it('comments and uncomments with and without the space after the marker', () => {
    expect(run(create('//a|'), toggleComment).doc.toString()).toBe('a');
    expect(run(select(create('  a\n\n    b'), [0, 9]), toggleComment).doc.toString()).toBe('  // a\n\n  //   b');
    const blank = create('  |\n');
    expect(toggleComment({ state: blank, dispatch: () => undefined })).toBe(false);
    expect(toggleComment({ state: create('text|', 'plain'), dispatch: () => undefined })).toBe(false);
    expect(run(create('<!--a-->|', 'html'), toggleComment).doc.toString()).toBe('a');
    expect(run(select(create('a {\n  b: c;\n}', 'css'), [0, 13]), toggleComment).doc.toString()).toBe('/* a {\n  b: c;\n} */');
    expect(run(create('/**/|', 'css'), toggleComment).doc.toString()).toBe('');
  });

  it('keeps the first line on top and the last line at the bottom', () => {
    const top = create('a|\nb');
    expect(run(top, moveLineUp)).toBe(top);
    const bottom = create('a\nb|');
    expect(run(bottom, moveLineDown)).toBe(bottom);
    expect(run(select(create('a\nb\nc\nd'), [2, 5]), moveLineDown).doc.toString()).toBe('a\nd\nb\nc');
  });

  it('copies lines up, keeping the cursor on the upper copy', () => {
    const copied = run(create('a\nb|'), copyLineUp);
    expect(copied.doc.toString()).toBe('a\nb\nb');
    expect(copied.selection.main.head).toBe(3);
    const down = run(create('a|'), copyLineDown);
    expect(down.selection.main.head).toBe(3);
    expect(run(select(create('a\nb\nc'), [4, 4], [0, 0]), copyLineDown).doc.toString()).toBe('a\nb\nc\na\nb\nc');
  });

  it('deletes the last line together with the line break before it', () => {
    expect(run(create('a\nb|'), deleteLine).doc.toString()).toBe('a');
    expect(run(create('a|'), deleteLine).doc.toString()).toBe('');
    expect(run(select(create('a\nb\nc'), [0, 0], [4, 4]), deleteLine).doc.toString()).toBe('b');
  });

  it('selects the whole document, also in a read-only editor', () => {
    const state = EditorState.create({ doc: 'abc', extensions: [EditorState.readOnly.of(true)] });
    const selected = run(state, selectAll);
    expect(selected.selection.main.from).toBe(0);
    expect(selected.selection.main.to).toBe(3);
  });

  it('refuses every editing command in a read-only editor', () => {
    const state = EditorState.create({ doc: 'a\nb', extensions: [EditorState.readOnly.of(true)] });
    const dispatch = vi.fn();
    for (const command of [indentMore, indentLess, insertNewline, smartBackspace, toggleComment, moveLineUp, moveLineDown, copyLineUp, copyLineDown, deleteLine]) {
      expect(command({ state, dispatch })).toBe(false);
    }
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('stops counting indents after 2000 lines and prefers the most frequent step', () => {
    const lines = Array.from({ length: 2100 }, (_, index) => (index < 2002 ? (index % 2 ? '   x' : 'x') : index % 2 ? '  x' : 'x'));
    expect(detectTabSize(lines.join('\n'))).toBe(3);
    expect(detectTabSize('a\n          b')).toBe(4);
    expect(detectTabSize('', 8)).toBe(8);
  });

  it('tells undo and redo transactions from edits', () => {
    const state = create('a|');
    const typed = state.update({ changes: { from: 1, insert: 'b' }, userEvent: 'input.type' });
    expect(isHistoryTransaction(typed)).toBe(false);
    let undone: Transaction | null = null;
    undo({ state: typed.state, dispatch: (transaction) => (undone = transaction) });
    expect(isHistoryTransaction(undone as unknown as Transaction)).toBe(true);
  });
});

describe('auto close', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  it('closes brackets and quotes before spaces, closers and the line end', () => {
    expect(typing('|', '(')).toEqual({ handled: true, result: '(|)' });
    expect(typing('| x', '[')).toEqual({ handled: true, result: '[|] x' });
    expect(typing('f(|)', '{').result).toBe('f({|})');
    expect(typing('a = |', '"').result).toBe('a = "|"');
    expect(typing('|>', '`').result).toBe('`|`>');
  });

  it('types a plain bracket before a word and a plain quote after a word or a quote', () => {
    expect(typing('|a', '(')).toEqual({ handled: false, result: '(|a' });
    expect(typing('a|', "'")).toEqual({ handled: false, result: "a'|" });
    expect(typing('\\|', '"').handled).toBe(false);
    expect(typing('"|', '"').handled).toBe(false);
    expect(typing('|', 'x').handled).toBe(false);
  });

  it('wraps the selection in a pair', () => {
    const view = mount(create('ab', 'javascript', 2, autoClose));
    view.dispatch({ selection: EditorSelection.range(0, 2) });
    expect(type(view, '(')).toBe(true);
    expect(view.state.doc.toString()).toBe('(ab)');
    expect(view.state.sliceDoc(view.state.selection.main.from, view.state.selection.main.to)).toBe('ab');
    view.dispatch({ selection: EditorSelection.range(1, 3) });
    expect(type(view, 'x')).toBe(false);
    expect(view.state.doc.toString()).toBe('(x)');
  });

  it('steps over a closing character that is already there', () => {
    expect(typing('(a|)', ')')).toEqual({ handled: true, result: '(a)|' });
    expect(typing('"a|"', '"')).toEqual({ handled: true, result: '"a"|' });
    expect(typing('a|', ')').handled).toBe(false);
  });

  it('closes HTML and Markdown tags on >', () => {
    expect(typing('<div class="a"|', '>', 'html')).toEqual({ handled: true, result: '<div class="a">|</div>' });
    expect(typing('<em|', '>', 'markdown').result).toBe('<em>|</em>');
    expect(typing('<br|', '>', 'html')).toEqual({ handled: false, result: '<br>|' });
    expect(typing('<img /|', '>', 'html').handled).toBe(false);
    expect(typing('a |', '>', 'html').handled).toBe(false);
    expect(typing('<div|', '>', 'javascript').handled).toBe(false);
  });

  it('stays out of read-only editors, compositions, pasted text and multiple cursors', () => {
    expect(typing('|', '(', 'javascript', EditorState.readOnly.of(true)).handled).toBe(false);
    const composing = mount(create('|', 'javascript', 2, autoClose));
    Object.defineProperty(composing, 'composing', { value: true });
    expect(type(composing, '(')).toBe(false);
    expect(typing('|', '()').handled).toBe(false);
    const multiple = mount(create('a b', 'javascript', 2, autoClose));
    multiple.dispatch({ selection: EditorSelection.create([EditorSelection.cursor(1), EditorSelection.cursor(3)]) });
    expect(type(multiple, '(')).toBe(false);
  });
});

describe('history in detail', () => {
  it('clears itself on edits kept out of history and records edits without a user event', () => {
    let state = create('|');
    state = state.update({ changes: { from: 0, insert: 'a' } }).state;
    expect(historyDepth(state)).toEqual({ undo: 1, redo: 0 });
    state = state.update({ changes: { from: 1, insert: 'b' }, annotations: Transaction.addToHistory.of(false) }).state;
    expect(historyDepth(state)).toEqual({ undo: 0, redo: 0 });
    state = state.update({ changes: { from: 0, insert: 'c' } }).state;
    state = state.update({ annotations: historyAction.of('reset') }).state;
    expect(historyDepth(state)).toEqual({ undo: 0, redo: 0 });
  });

  it('reports an empty history and refuses undo without the history field or in a read-only editor', () => {
    const bare = EditorState.create({ doc: 'a' });
    expect(historyDepth(bare)).toEqual({ undo: 0, redo: 0 });
    expect(undo({ state: bare, dispatch: () => undefined })).toBe(false);
    const readOnly = EditorState.create({ doc: 'a', extensions: [historyField, EditorState.readOnly.of(true)] }).update({ changes: { from: 1, insert: 'b' } }).state;
    expect(historyDepth(readOnly).undo).toBe(1);
    expect(undo({ state: readOnly, dispatch: () => undefined })).toBe(false);
    expect(redo({ state: readOnly, dispatch: () => undefined })).toBe(false);
  });
});

describe('search in detail', () => {
  it('builds no pattern for an empty query and skips empty matches', () => {
    expect(searchPattern({ text: '', matchCase: false, wholeWord: false, regexp: false })).toBeNull();
    expect(findMatches('abc', { text: '', matchCase: false, wholeWord: false, regexp: false })).toEqual({ matches: [], valid: true, pattern: null });
    expect(findMatches('ab', { text: 'x*', matchCase: false, wholeWord: false, regexp: true }).matches).toEqual([]);
    expect(findMatches('a.b', { text: '.', matchCase: false, wholeWord: false, regexp: false }).matches).toEqual([{ from: 1, to: 2 }]);
  });

  it('keeps the replacement text for plain and broken queries', () => {
    const state = create('a1');
    const match = { from: 1, to: 2 };
    expect(replacementFor(state, match, { text: '1', matchCase: false, wholeWord: false, regexp: false }, '$1')).toBe('$1');
    expect(replacementFor(state, match, { text: '(', matchCase: false, wholeWord: false, regexp: true }, 'x')).toBe('x');
  });

  it('marks the matches and the current one, and maps them through edits', () => {
    let state = EditorState.create({ doc: 'ab ab', extensions: [searchMarks] });
    state = state.update({ effects: setSearchMarks.of({ matches: [{ from: 0, to: 2 }, { from: 3, to: 5 }], current: 1 }) }).state;
    const marks: string[] = [];
    const collect = () => {
      marks.length = 0;
      state.field(searchMarks).between(0, state.doc.length, (from, to, decoration) => {
        marks.push(`${from}-${to}:${decoration.spec.class}`);
      });
    };
    collect();
    expect(marks).toEqual(['0-2:tx-code-editor__match', '3-5:tx-code-editor__match tx-code-editor__match--current']);
    state = state.update({ changes: { from: 0, insert: 'x' } }).state;
    collect();
    expect(marks[0]).toBe('1-3:tx-code-editor__match');
  });
});

describe('brackets in detail', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  it('skips nested pairs going back and gives up without a partner', () => {
    const state = create('(a(b)c)');
    expect(matchBracket(state, 6)).toEqual([0, 6]);
    expect(matchBracket(state, 0)).toEqual([0, 6]);
    expect(matchBracket(create('(a'), 0)).toBeNull();
    expect(matchBracket(create('a)'), 1)).toBeNull();
  });

  it('highlights the pair next to the cursor only while nothing is selected', () => {
    const view = mount(create('f(a)|', 'javascript', 2, bracketMatching));
    expect(view.contentDOM.querySelectorAll('.tx-code-editor__bracket')).toHaveLength(2);
    view.dispatch({ selection: EditorSelection.range(0, 4) });
    expect(view.contentDOM.querySelectorAll('.tx-code-editor__bracket')).toHaveLength(0);
  });
});

describe('editor setup', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  const settings = {
    language: 'javascript' as TxCodeLanguage,
    readOnly: false,
    editable: true,
    lineNumbers: false,
    wordWrap: false,
    tabSize: 2,
    placeholder: '',
    attributes: { 'aria-label': 'Code' },
    indentGuides: false,
  };

  it('leaves out the gutter, wrapping, guides and placeholder when they are off', () => {
    const view = mount(EditorState.create({ doc: '  a', extensions: [codeEditorBase(), new TxCodeEditorCompartments().initial(settings)] }));
    expect(view.dom.querySelector('.cm-gutters')).toBeNull();
    expect(view.contentDOM.classList).not.toContain('cm-lineWrapping');
    expect(view.dom.querySelector('.tx-code-guides')).toBeNull();
    expect(view.dom.querySelector('.cm-placeholder')).toBeNull();
    expect(view.contentDOM.getAttribute('aria-label')).toBe('Code');
  });

  it('turns the gutter, wrapping and guides on', () => {
    const view = mount(
      EditorState.create({
        doc: 'a\n  b',
        extensions: [codeEditorBase(), new TxCodeEditorCompartments().initial({ ...settings, lineNumbers: true, wordWrap: true, indentGuides: true, placeholder: 'Type' })],
      }),
    );
    expect(view.dom.querySelector('.cm-gutters')).not.toBeNull();
    expect(view.contentDOM.classList).toContain('cm-lineWrapping');
    expect(view.dom.querySelector('.cm-line.tx-code-guides')).not.toBeNull();
    expect(view.dom.querySelector('.cm-line.tx-code-wrap-indent')).not.toBeNull();
  });

  it('runs Tab and Shift+Tab unless the editor was escaped', () => {
    let escaped = false;
    const [tab, shiftTab] = tabKeys(() => escaped);
    const view = mount(create('  a|'));
    expect(tab.run?.(view)).toBe(true);
    expect(view.state.doc.toString()).toBe('  a ');
    expect(shiftTab.run?.(view)).toBe(true);
    expect(view.state.doc.toString()).toBe('a ');
    escaped = true;
    expect(tab.run?.(view)).toBe(false);
    expect(shiftTab.run?.(view)).toBe(false);
    expect(view.state.doc.toString()).toBe('a ');
  });

  it('binds the editing keys to the commands', () => {
    const keys = TX_CODE_EDITING_KEYS.map((binding) => binding.key);
    expect(keys).toEqual(expect.arrayContaining(['Mod-z', 'Mod-Shift-z', 'Mod-y', 'Enter', 'Backspace', 'Mod-/', 'Mod-a']));
    const view = mount(create('a|'));
    expect(TX_CODE_EDITING_KEYS.find((binding) => binding.key === 'Mod-a')?.run?.(view)).toBe(true);
    expect(view.state.selection.main.to).toBe(1);
  });
});

describe('view plugins over hidden ranges', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  function hidden(from: number, to: number): Extension {
    return EditorView.decorations.of(Decoration.set(Decoration.replace({}).range(from, to)));
  }

  it('highlights only the visible lines around a hidden range', () => {
    const doc = `let a;\n// ${'x'.repeat(30)}\nlet c;`;
    const view = mount(create(doc, 'javascript', 2, [syntaxHighlight('javascript'), hidden(3, 32)]));
    expect(view.visibleRanges).toHaveLength(2);
    expect([...view.contentDOM.querySelectorAll('.tx-code-tok-keyword')].map((node) => node.textContent)).toEqual(['let', 'let']);
    view.dispatch({ changes: { from: 0, to: 3, insert: 'var' } });
    expect([...view.contentDOM.querySelectorAll('.tx-code-tok-keyword')].map((node) => node.textContent)).toEqual(['var', 'let']);
  });

  it('draws wrap indents and guides once per line when a line is split by hidden ranges', () => {
    const doc = `  ${'x'.repeat(60)}\n    y\n  z`;
    const view = mount(create(doc, 'javascript', 2, [wrapIndent, indentGuides, hidden(4, 26), hidden(30, 52)]));
    expect(view.visibleRanges).toHaveLength(3);
    const lines = [...view.contentDOM.querySelectorAll<HTMLElement>('.cm-line')];
    expect(lines.map((line) => line.style.getPropertyValue('--tx-code-guides'))).toEqual(['1', '2', '1']);
    expect(lines.map((line) => line.style.getPropertyValue('--tx-code-wrap-indent'))).toEqual(['2ch', '4ch', '2ch']);
  });

  it('redraws guides and wrap indents when the tab size changes', () => {
    const compartments = new TxCodeEditorCompartments();
    const view = mount(
      EditorState.create({
        doc: '    a',
        extensions: [
          compartments.initial({ language: 'plain', readOnly: false, editable: true, lineNumbers: false, wordWrap: true, tabSize: 4, placeholder: '', attributes: {}, indentGuides: true }),
        ],
      }),
    );
    const line = () => view.contentDOM.querySelector<HTMLElement>('.cm-line');
    expect(line()?.style.getPropertyValue('--tx-code-guides')).toBe('1');
    view.dispatch({ effects: compartments.tabSize.reconfigure(compartments.tabSizeExtension(2)) });
    expect(line()?.style.getPropertyValue('--tx-code-guides')).toBe('2');
    expect(line()?.style.getPropertyValue('--tx-code-guide-step')).toBe('2ch');
  });
});
