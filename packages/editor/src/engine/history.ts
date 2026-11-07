import { Command, EditorState, Plugin, PluginKey, SelectionBookmark, Transaction } from 'prosemirror-state';
import { ReplaceStep, Step } from 'prosemirror-transform';

interface TxHistoryEvent {
  steps: Step[];
  selection: SelectionBookmark;
  time: number;
  textual: boolean;
}

interface TxHistoryState {
  done: TxHistoryEvent[];
  undone: TxHistoryEvent[];
  closed: boolean;
}

const GROUP_DELAY = 500;
const DEPTH = 100;

export const historyKey = new PluginKey<TxHistoryState>('txHistory');

const empty = (): TxHistoryState => ({ done: [], undone: [], closed: true });

function invert(tr: Transaction): Step[] {
  return tr.steps.map((step, index) => step.invert(tr.docs[index])).reverse();
}

export function history(): Plugin<TxHistoryState> {
  return new Plugin<TxHistoryState>({
    key: historyKey,
    state: {
      init: empty,
      apply(tr, value, oldState) {
        const meta = tr.getMeta(historyKey) as TxHistoryState | 'reset' | 'close' | undefined;
        if (meta === 'reset') {
          return empty();
        }
        if (meta === 'close') {
          return { ...value, closed: true };
        }
        if (meta) {
          return meta;
        }
        if (!tr.docChanged) {
          return value;
        }
        if (tr.getMeta('addToHistory') === false) {
          return empty();
        }
        const now = Date.now();
        const last = value.done[value.done.length - 1];
        const steps = invert(tr);
        const textual = tr.steps.every((step) => step instanceof ReplaceStep);
        if (last && textual && last.textual && !value.closed && now - last.time < GROUP_DELAY) {
          const merged = { ...last, steps: [...steps, ...last.steps], time: now };
          return { done: [...value.done.slice(0, -1), merged], undone: [], closed: false };
        }
        const event = { steps, selection: oldState.selection.getBookmark(), time: now, textual };
        return { done: [...value.done, event].slice(-DEPTH), undone: [], closed: false };
      },
    },
  });
}

function travel(state: EditorState, dispatch: ((tr: Transaction) => void) | undefined, from: 'done' | 'undone'): boolean {
  const value = historyKey.getState(state);
  const event = value?.[from][value[from].length - 1];
  if (!value || !event) {
    return false;
  }
  if (!dispatch) {
    return true;
  }
  const tr = state.tr;
  const reverse: Step[] = [];
  for (const step of event.steps) {
    const before = tr.doc;
    if (!tr.maybeStep(step).failed) {
      reverse.unshift(step.invert(before));
    }
  }
  tr.setSelection(event.selection.resolve(tr.doc));
  const back = { steps: reverse, selection: state.selection.getBookmark(), time: 0, textual: false };
  const other = from === 'done' ? 'undone' : 'done';
  tr.setMeta(historyKey, { [from]: value[from].slice(0, -1), [other]: [...value[other], back], closed: true } as unknown as TxHistoryState);
  dispatch(tr.scrollIntoView());
  return true;
}

export const undo: Command = (state, dispatch) => travel(state, dispatch, 'done');

export const redo: Command = (state, dispatch) => travel(state, dispatch, 'undone');

export function canUndo(state: EditorState): boolean {
  return !!historyKey.getState(state)?.done.length;
}

export function canRedo(state: EditorState): boolean {
  return !!historyKey.getState(state)?.undone.length;
}

export function closeHistory(tr: Transaction): Transaction {
  return tr.setMeta(historyKey, 'close');
}
