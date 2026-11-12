import { Command, EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { parseHtml, serializeHtml } from './html';
import { editorKeymap } from './setup';
import { txEditorSchema as schema } from './schema';
import { addColumn, addRow, deleteColumn, goToCell, headerRowActive, insertTable, tableContext, tableResize, toggleHeaderRow } from './tables';

const GRID = '<table><tr><th>A</th><th>B</th></tr><tr><td>C</td><td>D</td></tr></table>';

function stateOf(html: string): EditorState {
  return EditorState.create({ schema, doc: parseHtml(html, document) });
}

function textPos(state: EditorState, text: string, offset = 0): number {
  let found = -1;
  state.doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text === text) {
      found = pos + offset;
    }
    return found === -1;
  });
  return found;
}

function at(state: EditorState, text: string, offset = 0): EditorState {
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, textPos(state, text, offset))));
}

function run(state: EditorState, command: Command): EditorState {
  let next = state;
  expect(command(state, (tr) => (next = state.apply(tr)))).toBe(true);
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
const keys = editorKeymap(() => undefined);

describe('table commands', () => {
  it('reads the row and column of the selection', () => {
    const state = stateOf(GRID);
    expect(tableContext(at(state, 'D'))).toMatchObject({ pos: 0, row: 1, column: 1 });
    expect(tableContext(state.apply(state.tr.setSelection(NodeSelection.create(state.doc, 1))))).toMatchObject({ row: 0, column: 0 });
    expect(tableContext(state.apply(state.tr.setSelection(NodeSelection.create(state.doc, 7))))).toMatchObject({ row: 0, column: 0 });
    expect(tableContext(stateOf('<p>x</p>'))).toBeNull();
  });

  it('adds a header row above the header and plain rows above body rows', () => {
    const above = run(at(stateOf(GRID), 'A'), addRow(false));
    expect(cells(above)).toEqual(['h:,h:', 'c:A,c:B', 'c:C,c:D']);
    expect(cells(run(at(stateOf(GRID), 'D'), addRow(false)))).toEqual(['h:A,h:B', 'c:,c:', 'c:C,c:D']);
    expect(cells(run(at(stateOf(GRID), 'C'), addColumn(false)))).toEqual(['h:,h:A,h:B', 'c:,c:C,c:D']);
    expect(addRow(true)(stateOf('<p>x</p>'))).toBe(false);
  });

  it('switches the header row on and off', () => {
    let state = at(stateOf('<table><tr><td>A</td></tr></table><p>after</p>'), 'A');
    expect(headerRowActive(state)).toBe(false);
    state = run(state, toggleHeaderRow);
    expect(headerRowActive(state)).toBe(true);
    expect(cells(state)).toEqual(['h:A']);
    expect(headerRowActive(stateOf('<p>x</p>'))).toBe(false);
  });

  it('removes the table with its last column and keeps a paragraph', () => {
    const state = run(at(stateOf('<table><tr><td>A</td></tr></table>'), 'A'), deleteColumn);
    expect(html(state)).toBe('');
    expect(state.doc.firstChild?.type.name).toBe('paragraph');
  });

  it('refuses a table inside a table', () => {
    expect(insertTable(at(stateOf(GRID), 'A'))).toBe(false);
  });

  it('moves backwards between cells and stays at the first one', () => {
    const back = run(at(stateOf(GRID), 'C'), goToCell(-1));
    expect(back.doc.textBetween(back.selection.from, back.selection.to)).toBe('B');
    const first = at(stateOf(GRID), 'A');
    expect(run(first, goToCell(-1)).selection.from).toBe(first.selection.from);
    expect(goToCell(1)(stateOf('<p>x</p>'))).toBe(false);
    expect(keys['Shift-Tab'](first)).toBe(true);
  });

  it('answers without applying', () => {
    const state = at(stateOf(GRID), 'D');
    expect(addRow(true)(state)).toBe(true);
    expect(goToCell(-1)(state)).toBe(true);
    expect(cells(state)).toEqual(['h:A,h:B', 'c:C,c:D']);
  });

  it('keeps Backspace and Delete inside cells', () => {
    const state = stateOf('<table><tr><td><p>A</p><p>B</p></td></tr></table>');
    expect(keys['Backspace'](at(state, 'A'))).toBe(true);
    expect(html(run(at(state, 'A'), keys['Backspace']))).toBe(html(state));
    expect(html(run(at(state, 'B'), keys['Backspace']))).toBe('<table><tbody><tr><td><p>AB</p></td></tr></tbody></table>');
    expect(html(run(at(state, 'B', 1), keys['Delete']))).toBe(html(state));
    expect(html(run(at(state, 'A', 1), keys['Delete']))).toBe('<table><tbody><tr><td><p>AB</p></td></tr></tbody></table>');
    const quote = stateOf('<blockquote><p>q</p></blockquote><p>x</p>');
    expect(html(run(at(quote, 'q', 1), keys['Delete']))).toBe('<blockquote><p>qx</p></blockquote>');
  });
});

describe('column resize', () => {
  const elementFromPoint = document.elementFromPoint;

  beforeAll(() => {
    document.elementFromPoint = () => null;
  });

  afterAll(() => {
    document.elementFromPoint = elementFromPoint;
  });

  let view: EditorView;
  const box = (right: number, width: number) => () => ({ x: 0, y: 0, top: 0, left: right - width, bottom: 20, right, width, height: 20, toJSON: () => ({}) }) as DOMRect;
  const mouse = (target: EventTarget, type: string, init: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent(type, { bubbles: true, cancelable: true, ...init }));
  const firstCells = () => Array.from(view.dom.querySelectorAll('tr')).map((row) => row.cells[0]);

  beforeEach(() => {
    view = new EditorView(document.createElement('div'), { state: stateOf(GRID), plugins: [tableResize()] });
    firstCells().forEach((cell) => (cell.getBoundingClientRect = box(100, 100)));
  });

  afterEach(() => view.destroy());

  it('shows the resize cursor only near the right edge of a cell', () => {
    const cell = firstCells()[0];
    mouse(cell, 'mousemove', { clientX: 50 });
    expect(view.dom.classList).not.toContain('tx-editor--column-resize');
    mouse(cell, 'mousemove', { clientX: 98 });
    expect(view.dom.classList).toContain('tx-editor--column-resize');
    mouse(view.dom, 'mouseleave');
    expect(view.dom.classList).not.toContain('tx-editor--column-resize');
    mouse(cell.querySelector('p')?.firstChild as Text, 'mousemove', { clientX: 98 });
    expect(view.dom.classList).not.toContain('tx-editor--column-resize');
    mouse(cell, 'mousemove', { clientX: 102 });
    expect(view.dom.classList).toContain('tx-editor--column-resize');
    mouse(view.dom, 'mousemove', { clientX: 98 });
    expect(view.dom.classList).not.toContain('tx-editor--column-resize');
  });

  it('drags the column to a new width and stores it on every cell', () => {
    const cell = firstCells()[0];
    expect(mouse(cell, 'mousedown', { clientX: 98 })).toBe(true);
    mouse(cell, 'mousemove', { clientX: 98 });
    expect(mouse(cell, 'mousedown', { clientX: 98, button: 2 })).toBe(true);
    expect(mouse(cell, 'mousedown', { clientX: 98 })).toBe(false);
    mouse(document, 'mousemove', { clientX: 20 });
    expect(firstCells().map((item) => item.style.width)).toEqual(['48px', '48px']);
    mouse(document, 'mousemove', { clientX: 158 });
    mouse(document, 'mouseup');
    expect(html(view.state)).toBe(
      '<table><tbody><tr><th data-colwidth="160" style="width: 160px"><p>A</p></th><th><p>B</p></th></tr><tr><td data-colwidth="160" style="width: 160px"><p>C</p></td><td><p>D</p></td></tr></tbody></table>',
    );
    mouse(document, 'mousemove', { clientX: 300 });
    expect(firstCells()[0].style.width).toBe('160px');
  });

  it('ignores the pointer while editing is off', () => {
    view.setProps({ editable: () => false });
    mouse(firstCells()[0], 'mousemove', { clientX: 98 });
    expect(view.dom.classList).not.toContain('tx-editor--column-resize');
  });
});
