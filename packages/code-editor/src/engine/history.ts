import { Annotation, ChangeSet, EditorSelection, EditorState, StateCommand, StateField, Transaction } from '@codemirror/state';

interface HistoryEvent {
  readonly changes: ChangeSet;
  readonly selection: EditorSelection;
  readonly time: number;
  readonly type: string;
}

interface HistoryState {
  readonly done: readonly HistoryEvent[];
  readonly undone: readonly HistoryEvent[];
}

export type TxHistoryAction = 'undo' | 'redo' | 'reset';

export const historyAction = Annotation.define<TxHistoryAction>();

const GROUP_DELAY = 500;
const DEPTH = 200;
const GROUPED = /^(input\.type|delete\.(backward|forward))/;

const EMPTY: HistoryState = { done: [], undone: [] };

export const historyField = StateField.define<HistoryState>({
  create: () => EMPTY,
  update(value, transaction) {
    const action = transaction.annotation(historyAction);
    if (action === 'reset') {
      return EMPTY;
    }
    if (!transaction.docChanged) {
      return value;
    }
    if (transaction.annotation(Transaction.addToHistory) === false) {
      return EMPTY;
    }
    const event: HistoryEvent = {
      changes: transaction.changes.invert(transaction.startState.doc),
      selection: transaction.startState.selection,
      time: Date.now(),
      type: transaction.annotation(Transaction.userEvent) ?? '',
    };
    if (action === 'undo') {
      return { done: value.done.slice(0, -1), undone: [...value.undone, event] };
    }
    if (action === 'redo') {
      return { done: [...value.done, event], undone: value.undone.slice(0, -1) };
    }
    const last = value.done[value.done.length - 1];
    if (last && event.time - last.time < GROUP_DELAY && GROUPED.test(event.type) && last.type === event.type) {
      const merged: HistoryEvent = { ...event, changes: event.changes.compose(last.changes), selection: last.selection };
      return { done: [...value.done.slice(0, -1), merged], undone: [] };
    }
    return { done: [...value.done, event].slice(-DEPTH), undone: [] };
  },
});

function travel(action: 'undo' | 'redo'): StateCommand {
  return ({ state, dispatch }) => {
    const history = state.field(historyField, false);
    const stack = action === 'undo' ? history?.done : history?.undone;
    const event = stack?.[stack.length - 1];
    if (!event || state.readOnly) {
      return false;
    }
    dispatch(
      state.update({
        changes: event.changes,
        selection: event.selection,
        annotations: [historyAction.of(action), Transaction.userEvent.of(action)],
        scrollIntoView: true,
      }),
    );
    return true;
  };
}

export const undo = travel('undo');
export const redo = travel('redo');

export function historyDepth(state: EditorState): { undo: number; redo: number } {
  const history = state.field(historyField, false);
  return { undo: history?.done.length ?? 0, redo: history?.undone.length ?? 0 };
}
