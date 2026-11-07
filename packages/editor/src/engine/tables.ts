import { Node as ProseNode } from 'prosemirror-model';
import { Command, EditorState, Plugin, PluginKey, Selection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { insertNode } from './commands';
import { txEditorSchema as schema } from './schema';

const MIN_COLUMN_WIDTH = 48;
const RESIZE_ZONE = 5;

export interface TxTableContext {
  table: ProseNode;
  pos: number;
  row: number;
  column: number;
}

type TxCellGrid = ProseNode[][];

function emptyCell(header: boolean, colwidth: number | null = null): ProseNode {
  const type = header ? schema.nodes['table_header'] : schema.nodes['table_cell'];
  return type.create({ colwidth }, schema.nodes['paragraph'].create());
}

export function createTable(rows = 3, columns = 3, header = true): ProseNode {
  return schema.nodes['table'].create(
    null,
    Array.from({ length: rows }, (_, row) => schema.nodes['table_row'].create(null, Array.from({ length: columns }, () => emptyCell(header && row === 0)))),
  );
}

export function tableContext(state: EditorState): TxTableContext | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type.name === 'table') {
      return {
        table: $from.node(depth),
        pos: $from.before(depth),
        row: depth + 1 <= $from.depth ? $from.index(depth) : 0,
        column: depth + 2 <= $from.depth ? $from.index(depth + 1) : 0,
      };
    }
  }
  return null;
}

function grid(table: ProseNode): TxCellGrid {
  const rows: TxCellGrid = [];
  table.forEach((row) => {
    const cells: ProseNode[] = [];
    row.forEach((cell) => cells.push(cell));
    rows.push(cells);
  });
  return rows;
}

function cellStart(table: ProseNode, tablePos: number, row: number, column: number): number {
  let pos = tablePos + 1;
  for (let index = 0; index < row; index++) {
    pos += table.child(index).nodeSize;
  }
  pos += 1;
  const cells = table.child(row);
  for (let index = 0; index < column; index++) {
    pos += cells.child(index).nodeSize;
  }
  return pos + 1;
}

function rebuild(transform: (rows: TxCellGrid, context: TxTableContext) => { rows: TxCellGrid; row: number; column: number } | null): Command {
  return (state, dispatch) => {
    const context = tableContext(state);
    if (!context) {
      return false;
    }
    const result = transform(grid(context.table), context);
    if (!result) {
      return false;
    }
    if (dispatch) {
      const tr = state.tr;
      if (!result.rows.length || !result.rows[0].length) {
        tr.delete(context.pos, context.pos + context.table.nodeSize);
        if (!tr.doc.childCount) {
          tr.insert(0, schema.nodes['paragraph'].create());
        }
        tr.setSelection(Selection.near(tr.doc.resolve(Math.min(context.pos, tr.doc.content.size))));
      } else {
        const table = schema.nodes['table'].create(
          context.table.attrs,
          result.rows.map((cells) => schema.nodes['table_row'].create(null, cells)),
        );
        tr.replaceWith(context.pos, context.pos + context.table.nodeSize, table);
        const row = Math.min(result.row, result.rows.length - 1);
        const column = Math.min(result.column, result.rows[row].length - 1);
        tr.setSelection(TextSelection.near(tr.doc.resolve(cellStart(table, context.pos, row, column))));
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export const insertTable: Command = (state, dispatch) => {
  if (tableContext(state)) {
    return false;
  }
  return insertNode(createTable())(state, (tr) => {
    let tablePos = -1;
    tr.doc.descendants((node, pos) => {
      if (tablePos === -1 && node.type.name === 'table' && pos >= tr.mapping.map(state.selection.from, -1) - 2) {
        tablePos = pos;
      }
      return tablePos === -1;
    });
    if (tablePos !== -1) {
      tr.setSelection(TextSelection.near(tr.doc.resolve(tablePos + 3)));
    }
    dispatch?.(tr);
  });
};

export function addRow(after: boolean): Command {
  return rebuild((rows, { row, column }) => {
    const at = after ? row + 1 : row;
    const template = rows[Math.min(row + (after ? 0 : 0), rows.length - 1)];
    const header = !after && row === 0 && template.every((cell) => cell.type.name === 'table_header');
    const next = [...rows];
    next.splice(at, 0, template.map((cell) => emptyCell(header, cell.attrs['colwidth'])));
    if (header) {
      next[1] = next[1].map((cell) => schema.nodes['table_cell'].create(cell.attrs, cell.content));
    }
    return { rows: next, row: at, column };
  });
}

export function addColumn(after: boolean): Command {
  return rebuild((rows, { row, column }) => {
    const at = after ? column + 1 : column;
    return {
      rows: rows.map((cells) => {
        const next = [...cells];
        next.splice(at, 0, emptyCell(cells[Math.min(column, cells.length - 1)].type.name === 'table_header'));
        return next;
      }),
      row,
      column: at,
    };
  });
}

export const deleteRow: Command = rebuild((rows, { row, column }) => ({ rows: rows.filter((_, index) => index !== row), row: Math.max(0, row - 1), column }));

export const deleteColumn: Command = rebuild((rows, { row, column }) => ({
  rows: rows[0].length > 1 ? rows.map((cells) => cells.filter((_, index) => index !== column)) : [],
  row,
  column: Math.max(0, column - 1),
}));

export const deleteTable: Command = rebuild(() => ({ rows: [], row: 0, column: 0 }));

export const toggleHeaderRow: Command = rebuild((rows, { row, column }) => {
  const header = rows[0].every((cell) => cell.type.name === 'table_header');
  const type = header ? schema.nodes['table_cell'] : schema.nodes['table_header'];
  return { rows: [rows[0].map((cell) => type.create(cell.attrs, cell.content)), ...rows.slice(1)], row, column };
});

export function headerRowActive(state: EditorState): boolean {
  const context = tableContext(state);
  const first = context?.table.firstChild;
  return !!first && first.childCount > 0 && Array.from({ length: first.childCount }, (_, index) => first.child(index)).every((cell) => cell.type.name === 'table_header');
}

export function goToCell(direction: 1 | -1): Command {
  return (state, dispatch) => {
    const context = tableContext(state);
    if (!context) {
      return false;
    }
    const { table, pos, row, column } = context;
    const columns = table.child(row).childCount;
    let nextRow = row;
    let nextColumn = column + direction;
    if (nextColumn >= columns) {
      nextRow += 1;
      nextColumn = 0;
    } else if (nextColumn < 0) {
      nextRow -= 1;
      nextColumn = nextRow >= 0 ? table.child(nextRow).childCount - 1 : 0;
    }
    if (nextRow < 0) {
      return true;
    }
    if (nextRow >= table.childCount) {
      return addRow(true)(state, dispatch);
    }
    if (dispatch) {
      const start = cellStart(table, pos, nextRow, nextColumn);
      const $start = state.doc.resolve(start);
      dispatch(state.tr.setSelection(TextSelection.create(state.doc, start, $start.end())).scrollIntoView());
    }
    return true;
  };
}

export const stayInCell: Command = (state) => {
  const { $cursor } = state.selection as TextSelection;
  if (!$cursor || $cursor.depth < 2) {
    return false;
  }
  const cell = $cursor.node(-1);
  if (cell.type.name !== 'table_cell' && cell.type.name !== 'table_header') {
    return false;
  }
  const atStart = $cursor.parentOffset === 0 && $cursor.index(-1) === 0;
  return atStart;
};

export const stayInCellForward: Command = (state) => {
  const { $cursor } = state.selection as TextSelection;
  if (!$cursor || $cursor.depth < 2) {
    return false;
  }
  const cell = $cursor.node(-1);
  if (cell.type.name !== 'table_cell' && cell.type.name !== 'table_header') {
    return false;
  }
  return $cursor.parentOffset === $cursor.parent.content.size && $cursor.index(-1) === cell.childCount - 1;
};

const resizeKey = new PluginKey('txTableResize');

function cellAt(view: EditorView, event: MouseEvent): HTMLTableCellElement | null {
  const target = (event.target as HTMLElement | null)?.closest?.('td, th') as HTMLTableCellElement | null;
  if (!target || !view.dom.contains(target)) {
    return null;
  }
  const rect = target.getBoundingClientRect();
  return event.clientX >= rect.right - RESIZE_ZONE && event.clientX <= rect.right + RESIZE_ZONE ? target : null;
}

export function tableResize(): Plugin {
  let hover: HTMLTableCellElement | null = null;
  return new Plugin({
    key: resizeKey,
    props: {
      handleDOMEvents: {
        mousemove(view, event) {
          if (!view.editable) {
            return false;
          }
          hover = cellAt(view, event);
          view.dom.classList.toggle('tx-editor--column-resize', !!hover);
          return false;
        },
        mouseleave(view) {
          hover = null;
          view.dom.classList.remove('tx-editor--column-resize');
          return false;
        },
        mousedown(view, event) {
          const cell = hover;
          if (!cell || event.button !== 0) {
            return false;
          }
          event.preventDefault();
          const table = cell.closest('table') as HTMLTableElement;
          const index = cell.cellIndex;
          const start = event.clientX;
          const startWidth = cell.getBoundingClientRect().width;
          let width = startWidth;
          const cells = () => Array.from(table.rows).map((row) => row.cells[index]).filter(Boolean);
          const move = (next: MouseEvent) => {
            width = Math.round(Math.max(MIN_COLUMN_WIDTH, startWidth + next.clientX - start));
            cells().forEach((item) => (item.style.width = `${width}px`));
          };
          const up = () => {
            view.dom.ownerDocument.removeEventListener('mousemove', move);
            view.dom.ownerDocument.removeEventListener('mouseup', up);
            const tr = view.state.tr;
            cells().forEach((item) => {
              const pos = view.posAtDOM(item, 0) - 1;
              const node = tr.doc.nodeAt(pos);
              if (node && (node.type.name === 'table_cell' || node.type.name === 'table_header')) {
                tr.setNodeMarkup(pos, undefined, { ...node.attrs, colwidth: width });
              }
            });
            if (tr.docChanged) {
              view.dispatch(tr);
            }
          };
          view.dom.ownerDocument.addEventListener('mousemove', move);
          view.dom.ownerDocument.addEventListener('mouseup', up);
          return true;
        },
      },
    },
  });
}
