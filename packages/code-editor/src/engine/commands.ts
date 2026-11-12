import { ChangeSpec, EditorSelection, EditorState, Line, SelectionRange, StateCommand, Transaction, countColumn } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { getCodeMode } from '@tectra-ng/code-editor/highlight';
import { codeLanguage } from './language';

const OPENERS: Record<string, string> = { '(': ')', '[': ']', '{': '}', '"': '"', "'": "'", '`': '`' };
const CLOSERS = new Set([')', ']', '}', '"', "'", '`']);
const QUOTES = new Set(['"', "'", '`']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const OPEN_TAG_BEFORE = /<([A-Za-z][\w:.-]*)(?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?$/;
const OPEN_TAG_END = /<([A-Za-z][\w:.-]*)(?:\s(?:[^<>"']|"[^"]*"|'[^']*')*)?>$/;

function indentUnit(state: EditorState): string {
  return ' '.repeat(state.tabSize);
}

function leadingSpace(text: string): string {
  return text.slice(0, text.length - text.trimStart().length);
}

function touchedLines(state: EditorState, range: SelectionRange): Line[] {
  const lines: Line[] = [];
  const first = state.doc.lineAt(range.from);
  let last = state.doc.lineAt(range.to);
  if (!range.empty && range.to === last.from && last.number > first.number) {
    last = state.doc.line(last.number - 1);
  }
  for (let number = first.number; number <= last.number; number++) {
    lines.push(state.doc.line(number));
  }
  return lines;
}

function uniqueLines(state: EditorState): Line[] {
  const seen = new Set<number>();
  const lines: Line[] = [];
  for (const range of state.selection.ranges) {
    for (const line of touchedLines(state, range)) {
      if (!seen.has(line.number)) {
        seen.add(line.number);
        lines.push(line);
      }
    }
  }
  return lines;
}

function guard(command: StateCommand): StateCommand {
  return (target) => !target.state.readOnly && command(target);
}

export const indentMore: StateCommand = guard(({ state, dispatch }) => {
  const unit = indentUnit(state);
  const changes = uniqueLines(state)
    .filter((line) => line.length > 0 || state.selection.ranges.length === 1)
    .map((line) => ({ from: line.from, insert: unit }));
  dispatch(state.update({ changes, userEvent: 'input.indent' }));
  return true;
});

export const indentLess: StateCommand = guard(({ state, dispatch }) => {
  const changes: ChangeSpec[] = [];
  for (const line of uniqueLines(state)) {
    const space = leadingSpace(line.text);
    if (!space) {
      continue;
    }
    const remove = space.startsWith('\t') ? 1 : Math.min(space.length, ((countColumn(space, state.tabSize) - 1) % state.tabSize) + 1);
    changes.push({ from: line.from, to: line.from + remove });
  }
  if (changes.length) {
    dispatch(state.update({ changes, userEvent: 'delete.dedent' }));
  }
  return true;
});

export const insertTab: StateCommand = guard((target) => {
  const { state, dispatch } = target;
  if (state.selection.ranges.some((range) => !range.empty)) {
    return indentMore(target);
  }
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const column = countColumn(line.text.slice(0, range.from - line.from), state.tabSize);
        const insert = ' '.repeat(state.tabSize - (column % state.tabSize));
        return { changes: { from: range.from, insert }, range: EditorSelection.cursor(range.from + insert.length) };
      }),
      { userEvent: 'input.type', scrollIntoView: true },
    ),
  );
  return true;
});

function opensBlock(state: EditorState, before: string): boolean {
  const char = before.trimEnd().slice(-1);
  if (char === '{' || char === '[' || char === '(') {
    return true;
  }
  const language = state.facet(codeLanguage);
  if (language === 'html' || language === 'markdown') {
    const tag = OPEN_TAG_END.exec(before.trimEnd());
    return !!tag && !VOID_TAGS.has(tag[1].toLowerCase()) && !before.trimEnd().endsWith('/>');
  }
  return false;
}

function closesBlock(after: string): boolean {
  const text = after.trimStart();
  return /^[)\]}]/.test(text) || text.startsWith('</');
}

export const insertNewline: StateCommand = guard(({ state, dispatch }) => {
  const unit = indentUnit(state);
  dispatch(
    state.update(
      state.changeByRange((range) => {
        const line = state.doc.lineAt(range.from);
        const before = line.text.slice(0, range.from - line.from);
        const after = state.doc.sliceString(range.to, state.doc.lineAt(range.to).to);
        const indent = leadingSpace(before);
        const trimmedTo = after.length - after.trimStart().length;
        if (opensBlock(state, before)) {
          const inner = `\n${indent}${unit}`;
          if (closesBlock(after)) {
            return {
              changes: { from: range.from, to: range.to + trimmedTo, insert: `${inner}\n${indent}` },
              range: EditorSelection.cursor(range.from + inner.length),
            };
          }
          return { changes: { from: range.from, to: range.to, insert: inner }, range: EditorSelection.cursor(range.from + inner.length) };
        }
        const insert = `\n${indent}`;
        return { changes: { from: range.from, to: range.to, insert }, range: EditorSelection.cursor(range.from + insert.length) };
      }),
      { userEvent: 'input', scrollIntoView: true },
    ),
  );
  return true;
});

export const smartBackspace: StateCommand = guard(({ state, dispatch }) => {
  if (state.selection.ranges.some((range) => !range.empty)) {
    return false;
  }
  let handled = false;
  const transaction = state.changeByRange((range) => {
    const line = state.doc.lineAt(range.from);
    const before = line.text.slice(0, range.from - line.from);
    const previous = before.slice(-1);
    const next = state.doc.sliceString(range.from, range.from + 1);
    if (previous && OPENERS[previous] === next) {
      handled = true;
      return { changes: { from: range.from - 1, to: range.from + 1 }, range: EditorSelection.cursor(range.from - 1) };
    }
    if (before.length > 0 && /^ +$/.test(before)) {
      handled = true;
      const remove = ((before.length - 1) % state.tabSize) + 1;
      return { changes: { from: range.from - remove, to: range.from }, range: EditorSelection.cursor(range.from - remove) };
    }
    return { range };
  });
  if (!handled) {
    return false;
  }
  dispatch(state.update(transaction, { userEvent: 'delete.backward', scrollIntoView: true }));
  return true;
});

export const toggleComment: StateCommand = guard(({ state, dispatch }) => {
  const comments = getCodeMode(state.facet(codeLanguage)).comments;
  if (comments.line) {
    const token = comments.line;
    const lines = uniqueLines(state).filter((line) => line.text.trim());
    if (!lines.length) {
      return false;
    }
    const commented = lines.every((line) => line.text.trimStart().startsWith(token));
    const column = Math.min(...lines.map((line) => leadingSpace(line.text).length));
    const changes = lines.map((line) => {
      if (commented) {
        const at = line.from + leadingSpace(line.text).length;
        const space = line.text.charAt(at - line.from + token.length) === ' ' ? 1 : 0;
        return { from: at, to: at + token.length + space };
      }
      return { from: line.from + column, insert: `${token} ` };
    });
    dispatch(state.update({ changes, userEvent: commented ? 'delete.uncomment' : 'input.comment' }));
    return true;
  }
  if (!comments.block) {
    return false;
  }
  const [open, close] = comments.block;
  const changes: ChangeSpec[] = [];
  for (const range of state.selection.ranges) {
    const lines = touchedLines(state, range);
    const first = lines[0];
    const last = lines[lines.length - 1];
    const from = first.from + leadingSpace(first.text).length;
    const to = last.from + last.text.trimEnd().length;
    const text = state.doc.sliceString(from, to);
    if (text.startsWith(open) && text.endsWith(close) && text.length >= open.length + close.length) {
      const openSpace = text.charAt(open.length) === ' ' ? 1 : 0;
      const closeSpace = text.charAt(text.length - close.length - 1) === ' ' ? 1 : 0;
      changes.push({ from, to: from + open.length + openSpace }, { from: to - close.length - closeSpace, to });
    } else {
      changes.push({ from, insert: `${open} ` }, { from: to, insert: ` ${close}` });
    }
  }
  dispatch(state.update({ changes, userEvent: 'input.comment' }));
  return true;
});

function moveLines(direction: -1 | 1): StateCommand {
  return guard(({ state, dispatch }) => {
    const lines = uniqueLines(state).sort((a, b) => a.number - b.number);
    const first = lines[0];
    const last = lines[lines.length - 1];
    if ((direction < 0 && first.number === 1) || (direction > 0 && last.number === state.doc.lines)) {
      return true;
    }
    const block = state.doc.sliceString(first.from, last.to);
    if (direction < 0) {
      const above = state.doc.line(first.number - 1);
      dispatch(
        state.update({
          changes: { from: above.from, to: last.to, insert: `${block}\n${above.text}` },
          selection: EditorSelection.create(shifted(state, -(above.length + 1)), state.selection.mainIndex),
          userEvent: 'move.line',
          scrollIntoView: true,
        }),
      );
    } else {
      const below = state.doc.line(last.number + 1);
      dispatch(
        state.update({
          changes: { from: first.from, to: below.to, insert: `${below.text}\n${block}` },
          selection: EditorSelection.create(shifted(state, below.length + 1), state.selection.mainIndex),
          userEvent: 'move.line',
          scrollIntoView: true,
        }),
      );
    }
    return true;
  });
}

function shifted(state: EditorState, offset: number): SelectionRange[] {
  return state.selection.ranges.map((range) => EditorSelection.range(range.anchor + offset, range.head + offset));
}

export const moveLineUp = moveLines(-1);
export const moveLineDown = moveLines(1);

function copyLines(direction: -1 | 1): StateCommand {
  return guard(({ state, dispatch }) => {
    const lines = uniqueLines(state).sort((a, b) => a.number - b.number);
    const first = lines[0];
    const last = lines[lines.length - 1];
    const block = state.doc.sliceString(first.from, last.to);
    const offset = direction > 0 ? block.length + 1 : 0;
    dispatch(
      state.update({
        changes: { from: last.to, insert: `\n${block}` },
        selection: EditorSelection.create(state.selection.ranges.map((range) => EditorSelection.range(range.anchor + offset, range.head + offset))),
        userEvent: 'input.copyline',
        scrollIntoView: true,
      }),
    );
    return true;
  });
}

export const copyLineUp = copyLines(-1);
export const copyLineDown = copyLines(1);

export const deleteLine: StateCommand = guard(({ state, dispatch }) => {
  const lines = uniqueLines(state).sort((a, b) => a.number - b.number);
  const changes = lines.map((line) => {
    if (line.number < state.doc.lines) {
      return { from: line.from, to: line.to + 1 };
    }
    return { from: Math.max(0, line.from - 1), to: line.to };
  });
  dispatch(state.update({ changes, userEvent: 'delete.line', scrollIntoView: true }));
  return true;
});

export const selectAll: StateCommand = ({ state, dispatch }) => {
  dispatch(state.update({ selection: EditorSelection.single(0, state.doc.length), userEvent: 'select' }));
  return true;
};

function closeTagAt(state: EditorState, from: number): string | null {
  const language = state.facet(codeLanguage);
  if (language !== 'html' && language !== 'markdown') {
    return null;
  }
  const line = state.doc.lineAt(from);
  const before = line.text.slice(0, from - line.from);
  const tag = OPEN_TAG_BEFORE.exec(before);
  if (!tag || before.endsWith('/') || VOID_TAGS.has(tag[1].toLowerCase())) {
    return null;
  }
  return `</${tag[1]}>`;
}

export const autoClose = EditorView.inputHandler.of((view, from, to, text) => {
  const state = view.state;
  if (state.readOnly || view.composing || text.length !== 1 || state.selection.ranges.length > 1) {
    return false;
  }
  const next = state.doc.sliceString(to, to + 1);
  const previous = state.doc.sliceString(from - 1, from);
  if (from !== to && OPENERS[text]) {
    const inner = state.doc.sliceString(from, to);
    view.dispatch({
      changes: { from, to, insert: `${text}${inner}${OPENERS[text]}` },
      selection: EditorSelection.range(from + 1, from + 1 + inner.length),
      userEvent: 'input.type',
    });
    return true;
  }
  if (from === to && CLOSERS.has(text) && next === text) {
    view.dispatch({ selection: EditorSelection.cursor(to + 1), userEvent: 'input.type' });
    return true;
  }
  if (from === to && text === '>') {
    const close = closeTagAt(state, from);
    if (close) {
      view.dispatch({
        changes: { from, insert: `>${close}` },
        selection: EditorSelection.cursor(from + 1),
        userEvent: 'input.type',
      });
      return true;
    }
  }
  if (from === to && OPENERS[text] && (next === '' || /[\s)\]};,:>]/.test(next))) {
    if (QUOTES.has(text) && (/[\w\\]/.test(previous) || previous === text)) {
      return false;
    }
    view.dispatch({
      changes: { from, insert: `${text}${OPENERS[text]}` },
      selection: EditorSelection.cursor(from + 1),
      userEvent: 'input.type',
    });
    return true;
  }
  return false;
});

export function detectTabSize(text: string, fallback = 4): number {
  const counts = new Map<number, number>();
  let previous = 0;
  let checked = 0;
  for (const line of text.split('\n')) {
    if (!line.trim()) {
      continue;
    }
    if (line.startsWith('\t')) {
      return fallback;
    }
    const indent = leadingSpace(line).length;
    const step = Math.abs(indent - previous);
    if (step >= 2 && step <= 8) {
      counts.set(step, (counts.get(step) ?? 0) + 1);
    }
    previous = indent;
    if (++checked > 2000) {
      break;
    }
  }
  let best = fallback;
  let bestCount = 0;
  for (const [step, count] of counts) {
    if (count > bestCount) {
      best = step;
      bestCount = count;
    }
  }
  return best;
}

export function isHistoryTransaction(transaction: Transaction): boolean {
  return transaction.isUserEvent('undo') || transaction.isUserEvent('redo');
}
