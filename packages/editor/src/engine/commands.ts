import { Attrs, MarkType, NodeType, Node as ProseNode } from 'prosemirror-model';
import { AllSelection, Command, EditorState, NodeSelection, Selection, TextSelection, Transaction } from 'prosemirror-state';
import { findWrapping, liftTarget } from 'prosemirror-transform';
import { MAX_INDENT, txEditorSchema as schema } from './schema';

export type TxTextStyleAttr = 'color' | 'background' | 'fontSize' | 'fontFamily';

const TEXT_BLOCKS = new Set(['paragraph', 'heading']);

export function markActive(state: EditorState, type: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) {
    return !!type.isInSet(state.storedMarks ?? $from.marks());
  }
  return state.doc.rangeHasMark(from, to, type);
}

export function markAttrs(state: EditorState, type: MarkType): Attrs | null {
  const { $from, from, to, empty } = state.selection;
  if (empty) {
    return type.isInSet(state.storedMarks ?? $from.marks())?.attrs ?? null;
  }
  let found: Attrs | null = null;
  state.doc.nodesBetween(from, to, (node) => {
    found ??= type.isInSet(node.marks)?.attrs ?? null;
    return !found;
  });
  return found;
}

export function toggleMark(type: MarkType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const { empty, ranges, $cursor } = state.selection as TextSelection;
    if ((empty && !$cursor) || state.selection.$from.parent.type.spec.code) {
      return false;
    }
    if (!dispatch) {
      return true;
    }
    if ($cursor) {
      const active = type.isInSet(state.storedMarks ?? $cursor.marks());
      dispatch(active ? state.tr.removeStoredMark(type) : state.tr.addStoredMark(type.create(attrs)));
      return true;
    }
    const has = ranges.some(({ $from, $to }) => state.doc.rangeHasMark($from.pos, $to.pos, type));
    const tr = state.tr;
    for (const { $from, $to } of ranges) {
      if (has) {
        tr.removeMark($from.pos, $to.pos, type);
      } else {
        tr.addMark($from.pos, $to.pos, type.create(attrs));
      }
    }
    dispatch(tr.scrollIntoView());
    return true;
  };
}

export function setMark(type: MarkType, attrs: Attrs | null): Command {
  return (state, dispatch) => {
    const { from, to, empty } = state.selection;
    if (dispatch) {
      const tr = state.tr;
      if (empty) {
        tr.removeStoredMark(type);
        if (attrs) {
          tr.addStoredMark(type.create(attrs));
        }
      } else {
        tr.removeMark(from, to, type);
        if (attrs) {
          tr.addMark(from, to, type.create(attrs));
        }
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function setTextStyle(attr: TxTextStyleAttr, value: string | null): Command {
  return (state, dispatch) => {
    const type = schema.marks['text_style'];
    const { from, to, empty, $from } = state.selection;
    if ($from.parent.type.spec.code) {
      return false;
    }
    if (!dispatch) {
      return true;
    }
    const tr = state.tr;
    const merge = (marks: readonly import('prosemirror-model').Mark[]) => {
      const current = type.isInSet(marks)?.attrs ?? {};
      const next = { color: null, background: null, fontSize: null, fontFamily: null, ...current, [attr]: value };
      return Object.values(next).some(Boolean) ? type.create(next) : null;
    };
    if (empty) {
      const mark = merge(state.storedMarks ?? $from.marks());
      tr.removeStoredMark(type);
      if (mark) {
        tr.addStoredMark(mark);
      }
    } else {
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (!node.isText) {
          return true;
        }
        const start = Math.max(pos, from);
        const end = Math.min(pos + node.nodeSize, to);
        const mark = merge(node.marks);
        tr.removeMark(start, end, type);
        if (mark) {
          tr.addMark(start, end, mark);
        }
        return false;
      });
    }
    dispatch(tr.scrollIntoView());
    return true;
  };
}

export function clearFormatting(): Command {
  return (state, dispatch) => {
    if (!dispatch) {
      return true;
    }
    const { from, to } = state.selection;
    const tr = state.tr.removeMark(from, to).setStoredMarks([]);
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (node.type.name === 'heading' || (node.isTextblock && (node.attrs['align'] || node.attrs['indent']))) {
        tr.setNodeMarkup(pos, schema.nodes['paragraph'], { align: null, indent: 0, dir: null });
      }
      return true;
    });
    dispatch(tr.scrollIntoView());
    return true;
  };
}

export function blockActive(state: EditorState, type: NodeType, attrs: Attrs = {}): boolean {
  const { $from, to, node } = state.selection as NodeSelection;
  if (node) {
    return node.hasMarkup(type, attrs);
  }
  return to <= $from.end() && $from.parent.type === type && Object.entries(attrs).every(([key, value]) => $from.parent.attrs[key] === value);
}

export function setBlockType(type: NodeType, attrs: Attrs = {}): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    let applicable = false;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (applicable) {
        return false;
      }
      if (!node.isTextblock || node.hasMarkup(type, attrs)) {
        return true;
      }
      const $pos = state.doc.resolve(pos);
      applicable = $pos.parent.canReplaceWith($pos.index(), $pos.index() + 1, type);
      return false;
    });
    if (!applicable) {
      return false;
    }
    if (dispatch) {
      const keep = TEXT_BLOCKS.has(type.name);
      const tr = state.tr;
      state.doc.nodesBetween(from, to, (node, pos) => {
        if (node.isTextblock && !node.hasMarkup(type, attrs)) {
          const inherited = keep && TEXT_BLOCKS.has(node.type.name) ? { align: node.attrs['align'], indent: node.attrs['indent'], dir: node.attrs['dir'] } : {};
          tr.setBlockType(tr.mapping.map(pos), tr.mapping.map(pos + node.nodeSize), type, { ...inherited, ...attrs });
          return false;
        }
        return true;
      });
      dispatch(tr.scrollIntoView());
    }
    return true;
  };
}

export function toggleBlockType(type: NodeType, attrs: Attrs = {}): Command {
  return (state, dispatch) =>
    blockActive(state, type, attrs) ? setBlockType(schema.nodes['paragraph'])(state, dispatch) : setBlockType(type, attrs)(state, dispatch);
}

export function setBlockAttr(name: 'align' | 'dir', value: string | null): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (TEXT_BLOCKS.has(node.type.name) && node.attrs[name] !== value) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, [name]: value });
      }
      return true;
    });
    if (!tr.docChanged) {
      return false;
    }
    dispatch?.(tr.scrollIntoView());
    return true;
  };
}

export function blockAttr(state: EditorState, name: 'align' | 'indent' | 'dir'): unknown {
  const parent = state.selection.$from.parent;
  return TEXT_BLOCKS.has(parent.type.name) ? parent.attrs[name] : null;
}

export function shiftIndent(delta: number): Command {
  return (state, dispatch) => {
    const { from, to } = state.selection;
    const tr = state.tr;
    state.doc.nodesBetween(from, to, (node, pos) => {
      if (!TEXT_BLOCKS.has(node.type.name)) {
        return true;
      }
      const parent = state.doc.resolve(pos).parent;
      if (parent.type.name === 'list_item' || parent.type.name === 'task_item') {
        return false;
      }
      const indent = Math.max(0, Math.min(MAX_INDENT, Number(node.attrs['indent'] ?? 0) + delta));
      if (indent !== node.attrs['indent']) {
        tr.setNodeMarkup(pos, undefined, { ...node.attrs, indent });
      }
      return false;
    });
    if (!tr.docChanged) {
      return false;
    }
    dispatch?.(tr.scrollIntoView());
    return true;
  };
}

export function wrapIn(type: NodeType, attrs: Attrs | null = null): Command {
  return (state, dispatch) => {
    const { $from, $to } = state.selection;
    const range = $from.blockRange($to);
    const wrapping = range && findWrapping(range, type, attrs);
    if (!range || !wrapping) {
      return false;
    }
    dispatch?.(state.tr.wrap(range, wrapping).scrollIntoView());
    return true;
  };
}

export function lift(state: EditorState, dispatch?: (tr: Transaction) => void): boolean {
  const { $from, $to } = state.selection;
  const range = $from.blockRange($to);
  const target = range && liftTarget(range);
  if (!range || target === null || target === undefined) {
    return false;
  }
  dispatch?.(state.tr.lift(range, target).scrollIntoView());
  return true;
}

export function toggleWrap(type: NodeType): Command {
  return (state, dispatch) => {
    const { $from } = state.selection;
    for (let depth = $from.depth; depth > 0; depth--) {
      if ($from.node(depth).type === type) {
        const range = $from.blockRange(state.selection.$to, (node) => node.type === type);
        const target = range && liftTarget(range);
        if (range && target !== null && target !== undefined) {
          dispatch?.(state.tr.lift(range, target).scrollIntoView());
          return true;
        }
        return false;
      }
    }
    return wrapIn(type)(state, dispatch);
  };
}

export const deleteSelection: Command = (state, dispatch) => {
  if (state.selection.empty) {
    return false;
  }
  dispatch?.(state.tr.deleteSelection().scrollIntoView());
  return true;
};

function textblockStart(state: EditorState): import('prosemirror-model').ResolvedPos | null {
  const { $cursor } = state.selection as TextSelection;
  return $cursor && $cursor.parentOffset === 0 ? $cursor : null;
}

function textblockEnd(state: EditorState): import('prosemirror-model').ResolvedPos | null {
  const { $cursor } = state.selection as TextSelection;
  return $cursor && $cursor.parentOffset === $cursor.parent.content.size ? $cursor : null;
}

export const outdentAtStart: Command = (state, dispatch) => {
  const $cursor = textblockStart(state);
  if (!$cursor || !TEXT_BLOCKS.has($cursor.parent.type.name) || !$cursor.parent.attrs['indent']) {
    return false;
  }
  return shiftIndent(-1)(state, dispatch);
};

export const headingToParagraphAtStart: Command = (state, dispatch) => {
  const $cursor = textblockStart(state);
  if (!$cursor || ($cursor.parent.type.name !== 'heading' && $cursor.parent.type.name !== 'code_block')) {
    return false;
  }
  if ($cursor.parent.type.name === 'code_block' && $cursor.parent.content.size > 0) {
    return false;
  }
  return setBlockType(schema.nodes['paragraph'])(state, dispatch);
};

export const liftFromQuoteAtStart: Command = (state, dispatch) => {
  const $cursor = textblockStart(state);
  if (!$cursor || $cursor.depth < 2 || $cursor.node(-1).type.name !== 'blockquote' || $cursor.index(-1) !== 0) {
    return false;
  }
  return lift(state, dispatch);
};

export const joinBackward: Command = (state, dispatch) => {
  const $cursor = textblockStart(state);
  if (!$cursor) {
    return false;
  }
  const $cut = state.doc.resolve($cursor.before());
  const before = $cut.nodeBefore;
  if (before && before.isAtom && before.isBlock) {
    if (dispatch) {
      const tr = state.tr;
      if ($cursor.parent.content.size === 0) {
        tr.delete($cursor.before(), $cursor.after());
        tr.setSelection(NodeSelection.create(tr.doc, $cut.pos - before.nodeSize));
      } else {
        tr.setSelection(NodeSelection.create(state.doc, $cut.pos - before.nodeSize));
      }
      dispatch(tr.scrollIntoView());
    }
    return true;
  }
  const target = Selection.findFrom($cut, -1, true);
  if (!target || target.from >= $cursor.pos) {
    return false;
  }
  if (dispatch) {
    const tr = state.tr.delete(target.from, $cursor.pos);
    tr.setSelection(TextSelection.create(tr.doc, target.from));
    dispatch(tr.scrollIntoView());
  }
  return true;
};

export const joinForward: Command = (state, dispatch) => {
  const $cursor = textblockEnd(state);
  if (!$cursor) {
    return false;
  }
  const $cut = state.doc.resolve($cursor.after());
  const after = $cut.nodeAfter;
  if (after && after.isAtom && after.isBlock) {
    if (dispatch) {
      dispatch(state.tr.setSelection(NodeSelection.create(state.doc, $cut.pos)).scrollIntoView());
    }
    return true;
  }
  const target = Selection.findFrom($cut, 1, true);
  if (!target || target.from <= $cursor.pos) {
    return false;
  }
  dispatch?.(state.tr.delete($cursor.pos, target.from).scrollIntoView());
  return true;
};

export const selectAll: Command = (state, dispatch) => {
  dispatch?.(state.tr.setSelection(new AllSelection(state.doc)));
  return true;
};

export const newlineInCode: Command = (state, dispatch) => {
  const { $head, $anchor } = state.selection;
  if (!$head.parent.type.spec.code || !$head.sameParent($anchor)) {
    return false;
  }
  const text = $head.parent.textContent;
  const atEnd = $head.parentOffset === $head.parent.content.size;
  if (atEnd && text.endsWith('\n\n')) {
    if (dispatch) {
      const tr = state.tr.delete($head.pos - 2, $head.pos);
      const after = tr.mapping.map($head.after());
      tr.insert(after, schema.nodes['paragraph'].create());
      tr.setSelection(TextSelection.create(tr.doc, after + 1));
      dispatch(tr.scrollIntoView());
    }
    return true;
  }
  dispatch?.(state.tr.insertText('\n').scrollIntoView());
  return true;
};

export const exitCode: Command = (state, dispatch) => {
  const { $head } = state.selection;
  if (!$head.parent.type.spec.code) {
    return false;
  }
  if (dispatch) {
    const after = $head.after();
    const tr = state.tr.insert(after, schema.nodes['paragraph'].create());
    tr.setSelection(TextSelection.create(tr.doc, after + 1));
    dispatch(tr.scrollIntoView());
  }
  return true;
};

export const liftEmptyBlock: Command = (state, dispatch) => {
  const { $cursor } = state.selection as TextSelection;
  if (!$cursor || $cursor.parent.content.size || $cursor.depth < 2) {
    return false;
  }
  return lift(state, dispatch);
};

export const splitBlock: Command = (state, dispatch) => {
  const { $from, $to } = state.selection;
  if (state.selection instanceof NodeSelection && state.selection.node.isBlock) {
    return false;
  }
  if (!$from.parent.isBlock) {
    return false;
  }
  if (state.selection.empty && $from.parentOffset === 0 && $from.parent.type.name === 'heading' && $from.parent.content.size > 0) {
    dispatch?.(state.tr.insert($from.before(), schema.nodes['paragraph'].create()).scrollIntoView());
    return true;
  }
  if (dispatch) {
    const atEnd = $to.parentOffset === $to.parent.content.size;
    const tr = state.tr;
    if (!state.selection.empty) {
      tr.deleteSelection();
    }
    const parent = $from.parent;
    const nextType = atEnd && parent.type.name === 'heading' ? schema.nodes['paragraph'] : null;
    const keep = TEXT_BLOCKS.has(parent.type.name) ? { align: parent.attrs['align'], indent: parent.attrs['indent'], dir: parent.attrs['dir'] } : null;
    const types = nextType ? [{ type: nextType, attrs: keep ?? undefined }] : keep && atEnd ? [{ type: parent.type, attrs: { ...parent.attrs } }] : undefined;
    tr.split(tr.mapping.map($from.pos), 1, types);
    const marks = state.storedMarks ?? ($to.parentOffset ? $from.marks() : null);
    if (marks) {
      tr.ensureMarks(marks);
    }
    dispatch(tr.scrollIntoView());
  }
  return true;
};

export const insertHardBreak: Command = (state, dispatch) => {
  if (state.selection.$from.parent.type.spec.code) {
    return false;
  }
  dispatch?.(state.tr.replaceSelectionWith(schema.nodes['hard_break'].create()).scrollIntoView());
  return true;
};

export function insertNode(node: ProseNode): Command {
  return (state, dispatch) => {
    if (!dispatch) {
      return true;
    }
    const { $from, empty } = state.selection;
    const tr = state.tr;
    let after: number;
    if (node.isBlock && empty && $from.parent.isTextblock && $from.depth > 0) {
      const parent = $from.parent;
      if (parent.content.size === 0) {
        tr.replaceWith($from.before(), $from.after(), node);
        after = $from.before() + node.nodeSize;
      } else if ($from.parentOffset === 0) {
        tr.insert($from.before(), node);
        after = $from.before() + node.nodeSize;
      } else if ($from.parentOffset === parent.content.size) {
        tr.insert($from.after(), node);
        after = $from.after() + node.nodeSize;
      } else {
        tr.replaceSelectionWith(node);
        after = tr.mapping.map(state.selection.to);
      }
    } else {
      tr.replaceSelectionWith(node);
      after = tr.mapping.map(state.selection.to);
    }
    if (node.isBlock) {
      const $after = tr.doc.resolve(Math.min(after, tr.doc.content.size));
      if (!$after.nodeAfter && $after.depth === 0) {
        tr.insert($after.pos, schema.nodes['paragraph'].create());
      }
      const next = Selection.findFrom(tr.doc.resolve(Math.min(after, tr.doc.content.size)), 1, true);
      if (next) {
        tr.setSelection(next);
      }
    }
    dispatch(tr.scrollIntoView());
    return true;
  };
}

export function linkRange(state: EditorState): { from: number; to: number; href: string } | null {
  const type = schema.marks['link'];
  const { $from, from, to, empty } = state.selection;
  if (!empty) {
    const attrs = markAttrs(state, type);
    return attrs ? { from, to, href: String(attrs['href']) } : null;
  }
  const mark = type.isInSet($from.marks()) ?? ($from.nodeBefore ? type.isInSet($from.nodeBefore.marks) : null);
  if (!mark) {
    return null;
  }
  const pos = $from.pos;
  const parentStart = $from.start();
  const pieces: { from: number; to: number; has: boolean }[] = [];
  $from.parent.forEach((child, offset) => {
    pieces.push({ from: parentStart + offset, to: parentStart + offset + child.nodeSize, has: !!mark.isInSet(child.marks) });
  });
  const index = pieces.findIndex((piece) => piece.has && piece.from <= pos && pos <= piece.to);
  if (index === -1) {
    return null;
  }
  let first = index;
  let last = index;
  while (first > 0 && pieces[first - 1].has && pieces[first - 1].to === pieces[first].from) {
    first--;
  }
  while (last < pieces.length - 1 && pieces[last + 1].has && pieces[last + 1].from === pieces[last].to) {
    last++;
  }
  return { from: pieces[first].from, to: pieces[last].to, href: String(mark.attrs['href']) };
}
