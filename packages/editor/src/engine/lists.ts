import { Fragment, NodeRange, NodeType, Node as ProseNode, Slice } from 'prosemirror-model';
import { Command, EditorState, NodeSelection, TextSelection, Transaction } from 'prosemirror-state';
import { ReplaceAroundStep, canJoin, canSplit, findWrapping, liftTarget } from 'prosemirror-transform';
import { txEditorSchema as schema } from './schema';

const LISTS = ['bullet_list', 'ordered_list', 'task_list'];
const ITEMS = ['list_item', 'task_item'];

function itemTypeFor(list: NodeType): NodeType {
  return list.name === 'task_list' ? schema.nodes['task_item'] : schema.nodes['list_item'];
}

export function currentList(state: EditorState): { node: ProseNode; pos: number; depth: number } | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    const node = $from.node(depth);
    if (LISTS.includes(node.type.name)) {
      return { node, pos: $from.before(depth), depth };
    }
  }
  return null;
}

export function currentItemType(state: EditorState): NodeType | null {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if (ITEMS.includes($from.node(depth).type.name)) {
      return $from.node(depth).type;
    }
  }
  return null;
}

export function wrapInList(listType: NodeType): Command {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    const wrapping = range && findWrapping(range, listType);
    if (!range || !wrapping) {
      return false;
    }
    dispatch?.(state.tr.wrap(range, wrapping).scrollIntoView());
    return true;
  };
}

function convertList(tr: Transaction, list: { node: ProseNode; pos: number }, listType: NodeType): void {
  const itemType = itemTypeFor(listType);
  const items: ProseNode[] = [];
  list.node.forEach((item) => {
    items.push(item.type === itemType ? item : itemType.create(itemType.name === 'task_item' ? { checked: false } : null, item.content, item.marks));
  });
  const { from, to } = tr.selection;
  tr.replaceWith(list.pos, list.pos + list.node.nodeSize, listType.create(listType.name === 'ordered_list' ? { start: 1 } : null, items));
  tr.setSelection(TextSelection.create(tr.doc, from, to));
}

export function toggleList(listType: NodeType): Command {
  return (state, dispatch) => {
    const list = currentList(state);
    if (!list) {
      return wrapInList(listType)(state, dispatch);
    }
    if (list.node.type === listType) {
      return liftListItem(itemTypeFor(listType))(state, dispatch);
    }
    if (dispatch) {
      const tr = state.tr;
      convertList(tr, list, listType);
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function splitListItem(itemType?: NodeType): Command {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const type = itemType ?? currentItemType(state);
    if (!type || (state.selection instanceof NodeSelection && state.selection.node.isBlock) || $from.depth < 2 || !$from.sameParent($to)) {
      return false;
    }
    const item = $from.node(-1);
    if (item.type !== type) {
      return false;
    }
    if ($from.parent.content.size === 0 && item.childCount === $from.indexAfter(-1)) {
      return false;
    }
    const atEnd = $to.pos === $from.end();
    const nextType = atEnd ? item.contentMatchAt(0).defaultType : null;
    const tr = state.tr.delete($from.pos, $to.pos);
    const itemAttrs = type.name === 'task_item' ? { checked: false } : null;
    const types = [{ type, attrs: itemAttrs ?? undefined }, nextType ? { type: nextType } : null];
    if (!canSplit(tr.doc, $from.pos, 2, types)) {
      return false;
    }
    dispatch?.(tr.split($from.pos, 2, types).scrollIntoView());
    return true;
  };
}

export function sinkListItem(itemType?: NodeType): Command {
  return (state, dispatch) => {
    const type = itemType ?? currentItemType(state);
    if (!type) {
      return false;
    }
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild?.type === type);
    if (!range) {
      return false;
    }
    const startIndex = range.startIndex;
    if (startIndex === 0) {
      return false;
    }
    const parent = range.parent;
    const nodeBefore = parent.child(startIndex - 1);
    if (nodeBefore.type !== type) {
      return false;
    }
    if (dispatch) {
      const nestedBefore = nodeBefore.lastChild && nodeBefore.lastChild.type === parent.type;
      const inner = Fragment.from(nestedBefore ? type.create() : null);
      const slice = new Slice(Fragment.from(type.create(null, Fragment.from(parent.type.create(null, inner)))), nestedBefore ? 3 : 1, 0);
      const before = range.start;
      const after = range.end;
      dispatch(state.tr.step(new ReplaceAroundStep(before - (nestedBefore ? 3 : 1), after, before, after, slice, 1, true)).scrollIntoView());
    }
    return true;
  };
}

function liftToOuterList(state: EditorState, dispatch: (tr: Transaction) => void, itemType: NodeType, range: NodeRange): boolean {
  const tr = state.tr;
  const end = range.end;
  const endOfList = range.$to.end(range.depth);
  let lifted = range;
  if (end < endOfList) {
    tr.step(new ReplaceAroundStep(end - 1, endOfList, end, endOfList, new Slice(Fragment.from(itemType.create(null, range.parent.copy())), 1, 0), 1, true));
    lifted = new NodeRange(tr.doc.resolve(range.$from.pos), tr.doc.resolve(endOfList), range.depth);
  }
  const target = liftTarget(lifted);
  if (target === null || target === undefined) {
    return false;
  }
  tr.lift(lifted, target);
  const $after = tr.doc.resolve(tr.mapping.map(end, -1) - 1);
  if (canJoin(tr.doc, $after.pos) && $after.nodeBefore?.type === $after.nodeAfter?.type) {
    tr.join($after.pos);
  }
  dispatch(tr.scrollIntoView());
  return true;
}

function liftOutOfList(state: EditorState, dispatch: (tr: Transaction) => void, range: NodeRange): boolean {
  const tr = state.tr;
  const list = range.parent;
  for (let pos = range.end, index = range.endIndex - 1, end = range.startIndex; index > end; index--) {
    pos -= list.child(index).nodeSize;
    tr.delete(pos - 1, pos + 1);
  }
  const $start = tr.doc.resolve(range.start);
  const item = $start.nodeAfter;
  if (!item || tr.mapping.map(range.end) !== range.start + item.nodeSize) {
    return false;
  }
  const atStart = range.startIndex === 0;
  const atEnd = range.endIndex === list.childCount;
  const parent = $start.node(-1);
  const indexBefore = $start.index(-1);
  if (!parent.canReplace(indexBefore + (atStart ? 0 : 1), indexBefore + 1, item.content.append(atEnd ? Fragment.empty : Fragment.from(list)))) {
    return false;
  }
  const start = $start.pos;
  const end = start + item.nodeSize;
  tr.step(
    new ReplaceAroundStep(
      start - (atStart ? 1 : 0),
      end + (atEnd ? 1 : 0),
      start + 1,
      end - 1,
      new Slice((atStart ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))).append(atEnd ? Fragment.empty : Fragment.from(list.copy(Fragment.empty))), atStart ? 0 : 1, atEnd ? 0 : 1),
      atStart ? 0 : 1,
    ),
  );
  dispatch(tr.scrollIntoView());
  return true;
}

export function liftListItem(itemType?: NodeType): Command {
  return (state, dispatch) => {
    const type = itemType ?? currentItemType(state);
    if (!type) {
      return false;
    }
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to, (node) => node.childCount > 0 && node.firstChild?.type === type);
    if (!range) {
      return false;
    }
    if (!dispatch) {
      return true;
    }
    if ($from.node(range.depth - 1).type === type) {
      return liftToOuterList(state, dispatch, type, range);
    }
    return liftOutOfList(state, dispatch, range);
  };
}

export const liftEmptyListItem: Command = (state, dispatch) => {
  const { $from, empty } = state.selection;
  const type = currentItemType(state);
  if (!type || !empty || $from.parent.content.size > 0 || $from.node(-1).type !== type) {
    return false;
  }
  return liftListItem(type)(state, dispatch);
};

export const liftListItemAtStart: Command = (state, dispatch) => {
  const { $from, empty } = state.selection;
  const type = currentItemType(state);
  if (!type || !empty || $from.parentOffset > 0 || $from.depth < 2 || $from.node(-1).type !== type || $from.index(-1) !== 0) {
    return false;
  }
  return liftListItem(type)(state, dispatch);
};

export const sinkCurrentItem: Command = (state, dispatch) => sinkListItem()(state, dispatch);

export const liftCurrentItem: Command = (state, dispatch) => liftListItem()(state, dispatch);

export function toggleTask(pos: number): Command {
  return (state, dispatch) => {
    const node = state.doc.nodeAt(pos);
    if (!node || node.type.name !== 'task_item') {
      return false;
    }
    dispatch?.(state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: !node.attrs['checked'] }));
    return true;
  };
}
