import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { diffCode } from './diff';
import { TxDiffDocument, diffDocument, inlineRows, splitRows } from './diff-rows';
import { TxDiffSide, buildDiffDecorations, diffField, diffGutter, setDiffDecorations } from './diff-view';

function stubLayout(): void {
  const rect = { x: 0, y: 0, width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0, toJSON: () => ({}) } as DOMRect;
  const list = Object.assign([rect], { item: () => rect }) as unknown as DOMRectList;
  Range.prototype.getClientRects ??= () => list;
  Range.prototype.getBoundingClientRect ??= () => rect;
}

const views: EditorView[] = [];

function mount(doc: string): EditorView {
  const parent = document.createElement('div');
  document.body.appendChild(parent);
  const view = new EditorView({ parent, state: EditorState.create({ doc, extensions: [diffField, diffGutter()] }) });
  views.push(view);
  return view;
}

function show(view: EditorView, side: TxDiffSide, original: string, modified: string, language = 'javascript', guides = true): void {
  const changes = diffCode(original, modified);
  view.dispatch({ effects: setDiffDecorations.of(buildDiffDecorations(view.state, side, diffDocument(original, language), changes, guides)) });
}

function signs(view: EditorView): string[] {
  return [...view.dom.querySelectorAll('.tx-code-diff__sign')]
    .filter((sign) => (sign.parentElement as HTMLElement).style.visibility !== 'hidden')
    .map((sign) => `${sign.className.replace('tx-code-diff__sign tx-code-diff__sign--', '')}:${sign.childElementCount}`);
}

describe('diff decorations', () => {
  beforeEach(stubLayout);
  afterEach(() => views.splice(0).forEach((view) => view.destroy()));

  it('draws removed lines with colours, indents, guides and an empty-line break', () => {
    const original = 'let a = 1;\n\n    let b = 2;\nend';
    const modified = 'end';
    const view = mount(modified);
    show(view, 'inline', original, modified);
    const removed = view.dom.querySelector('.tx-code-diff__removed') as HTMLElement;
    const rows = [...removed.querySelectorAll<HTMLElement>('.tx-code-diff__row')];
    expect(rows).toHaveLength(3);
    expect(rows[0].querySelector('.tx-code-tok-keyword')?.textContent).toBe('let');
    expect(rows[1].querySelector('br')).not.toBeNull();
    expect(rows[2].style.getPropertyValue('--tx-code-wrap-indent')).toBe('4ch');
    expect(rows[2].classList).toContain('tx-code-guides');
    expect(rows[2].style.getPropertyValue('--tx-code-guide-step')).toBe('4ch');
    expect(signs(view)).toContain('removed:3');
  });

  it('keeps guides off when asked and puts lines removed at the end after the last line', () => {
    const view = mount('a');
    show(view, 'inline', 'a\n  b', 'a', 'plain', false);
    const row = view.dom.querySelector<HTMLElement>('.tx-code-diff__row') as HTMLElement;
    expect(row.classList).not.toContain('tx-code-guides');
    expect(row.querySelector('span')?.className).toBe('');
    expect(view.contentDOM.lastElementChild?.classList).toContain('tx-code-diff__removed');
  });

  it('keeps the drawn widgets and markers when the same decorations come again', () => {
    const view = mount('x\nc');
    show(view, 'inline', 'a\nb\nc', 'x\nc');
    const widget = view.dom.querySelector('.tx-code-diff__removed');
    show(view, 'inline', 'a\nb\nc', 'x\nc');
    expect(view.dom.querySelector('.tx-code-diff__removed')).toBe(widget);
    expect(signs(view)).toEqual(['removed:2', 'inserted:1']);
    show(view, 'inline', 'a\nB\nc', 'x\nc');
    expect(view.dom.querySelector('.tx-code-diff__removed')).not.toBe(widget);
  });

  it('marks changed characters inside removed lines and draws partial documents plainly', () => {
    const view = mount('const sum = 1;');
    show(view, 'inline', 'const total = 1;', 'const sum = 1;');
    expect(view.dom.querySelector('.tx-code-diff__removed .tx-code-diff__text--removed')?.textContent).toBe('total');
    expect(view.dom.querySelector('.cm-line .tx-code-diff__text--inserted')?.textContent).toBe('sum');
    const partial: TxDiffDocument = { lines: ['  gone', 'const sum = 1;'], tokens: [], guides: [], tabSize: 2 };
    view.dispatch({ effects: setDiffDecorations.of(buildDiffDecorations(view.state, 'inline', partial, diffCode('  gone\nconst sum = 1;', 'const sum = 1;'))) });
    const row = view.dom.querySelector<HTMLElement>('.tx-code-diff__row') as HTMLElement;
    expect(row.textContent).toBe('  gone');
    expect(row.classList).not.toContain('tx-code-guides');
  });

  it('lets events inside removed lines reach the editor', () => {
    const view = mount('b');
    show(view, 'inline', 'a\nb', 'b');
    const keydown = vi.fn();
    view.contentDOM.addEventListener('keydown', keydown);
    view.dom.querySelector('.tx-code-diff__row')?.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    expect(keydown).toHaveBeenCalled();
  });

  it('marks changed characters and pads the shorter side of a split view', () => {
    const original = 'const total = 1;\nkeep';
    const modified = 'const sum = 1;\nadded\nkeep';
    const left = mount(original);
    show(left, 'original', original, modified);
    expect(left.dom.querySelector('.cm-line.tx-code-diff__line--removed')).not.toBeNull();
    expect(left.dom.querySelector('.tx-code-diff__text--removed')?.textContent).toBe('total');
    expect(left.dom.querySelector<HTMLElement>('.tx-code-diff__filler')?.style.getPropertyValue('--tx-code-diff-filler-lines')).toBe('1');
    expect(signs(left)).toEqual(['removed:1']);
    const right = mount(modified);
    show(right, 'modified', original, modified);
    expect(right.dom.querySelectorAll('.cm-line.tx-code-diff__line--inserted')).toHaveLength(2);
    expect(right.dom.querySelector('.tx-code-diff__text--inserted')?.textContent).toBe('sum');
    expect(right.dom.querySelector('.tx-code-diff__filler')).toBeNull();
  });

  it('keeps fillers that are equal and puts a trailing filler after the last line', () => {
    const left = mount('a');
    show(left, 'original', 'a', 'a\nb\nc');
    const filler = left.dom.querySelector('.tx-code-diff__filler');
    expect(filler?.getAttribute('aria-hidden')).toBe('true');
    show(left, 'original', 'a', 'a\nb\nc');
    expect(left.dom.querySelector('.tx-code-diff__filler')).toBe(filler);
    expect(left.contentDOM.lastElementChild).toBe(filler);
  });

  it('moves the marks along with edits', () => {
    const view = mount('a\nB');
    show(view, 'inline', 'a\nb', 'a\nB');
    view.dispatch({ changes: { from: 0, insert: 'top\n' } });
    const lines = [...view.contentDOM.querySelectorAll('.cm-line')];
    expect(lines.map((line) => line.classList.contains('tx-code-diff__line--inserted'))).toEqual([false, false, true]);
  });
});

describe('diff rows of partial documents', () => {
  const partial: TxDiffDocument = { lines: ['a', '  b', 'c'], tokens: [], guides: [], tabSize: 2 };

  it('falls back to plain segments and no guides when tokens and guides are missing', () => {
    const changes = diffCode('a\n  b\nc', 'a\nc');
    const rows = inlineRows(partial, { lines: ['a', 'c'], tokens: [], guides: [], tabSize: 2 }, changes);
    expect(rows.map((row) => `${row.kind}:${row.segments.map((segment) => segment.text).join('')}:${row.guides}`)).toEqual(['equal:a:0', 'removed:  b:0', 'equal:c:0']);
  });

  it('pads the shorter side after the last change', () => {
    const rows = splitRows(partial, { lines: ['a'], tokens: [], guides: [], tabSize: 2 }, []);
    expect(rows.original.map((row) => row.kind)).toEqual(['equal', 'equal', 'equal']);
    expect(rows.modified.map((row) => row.kind)).toEqual(['equal', 'filler', 'filler']);
    const longer = splitRows({ lines: ['a'], tokens: [], guides: [], tabSize: 2 }, partial, []);
    expect(longer.original.map((row) => row.kind)).toEqual(['equal', 'filler', 'filler']);
  });
});

describe('character diff limits', () => {
  it('marks whole lines when they are too long to compare by character', () => {
    const [change] = diffCode(`${'x'.repeat(3500)}1`, `${'x'.repeat(3500)}2`);
    expect(change.originalRanges).toEqual([{ from: 0, to: 3501 }]);
    expect(change.modifiedRanges).toEqual([{ from: 0, to: 3501 }]);
    const [blank] = diffCode(' '.repeat(6001), '', { ignoreTrimWhitespace: false });
    expect(blank.originalRanges).toEqual([{ from: 0, to: 6001 }]);
    expect(blank.modifiedRanges).toEqual([]);
    const [added] = diffCode('', ' '.repeat(6001), { ignoreTrimWhitespace: false });
    expect(added.originalRanges).toEqual([]);
    expect(added.modifiedRanges).toEqual([{ from: 0, to: 6001 }]);
  });
});
