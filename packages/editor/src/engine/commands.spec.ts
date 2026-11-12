import { AllSelection, Command, EditorState, NodeSelection, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import {
  blockActive,
  blockAttr,
  clearFormatting,
  insertNode,
  linkRange,
  markActive,
  markAttrs,
  setBlockAttr,
  setBlockType,
  setMark,
  setTextStyle,
  shiftIndent,
  splitBlock,
  toggleBlockType,
  toggleMark,
  toggleWrap,
  wrapIn,
} from './commands';
import { canRedo, canUndo, closeHistory, historyKey, redo, undo } from './history';
import { parseHtml, serializeFragment, serializeHtml } from './html';
import { chain, isMac, keyName, keymap } from './keymap';
import { currentList, liftListItem, sinkListItem, splitListItem, toggleList, toggleTask } from './lists';
import { editorKeymap, editorPlugins } from './setup';
import { txEditorSchema as schema } from './schema';

const options = () => ({
  placeholder: () => '',
  maxLength: () => undefined,
  linkTarget: () => '_blank',
  triggers: () => [],
  suggestion: { change: () => undefined, keydown: () => false },
  openLink: () => undefined,
});

function stateOf(html: string, cursor = 1): EditorState {
  const state = EditorState.create({ schema, doc: parseHtml(html, document), plugins: editorPlugins(options()) });
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, cursor)));
}

function textPos(state: EditorState, text: string, offset = 0): number {
  let found = -1;
  state.doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text?.includes(text)) {
      found = pos + (node.text?.indexOf(text) ?? 0) + offset;
    }
    return found === -1;
  });
  return found;
}

function at(state: EditorState, text: string, offset = 0): EditorState {
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, textPos(state, text, offset))));
}

function select(state: EditorState, text: string): EditorState {
  const start = textPos(state, text);
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, start, start + text.length)));
}

function selectRange(state: EditorState, from: number, to: number): EditorState {
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, from, to)));
}

function selectNode(state: EditorState, pos: number): EditorState {
  return state.apply(state.tr.setSelection(NodeSelection.create(state.doc, pos)));
}

function run(state: EditorState, command: Command): EditorState {
  let next = state;
  const handled = command(state, (tr) => (next = state.apply(tr)));
  expect(handled).toBe(true);
  return next;
}

const html = (state: EditorState) => serializeHtml(state.doc, document).replace(/;"/g, '"');
const keys = editorKeymap(() => undefined);

describe('mark commands', () => {
  it('toggles a stored mark on the cursor and refuses code blocks', () => {
    let state = at(stateOf('<p>Hello</p>'), 'Hello', 5);
    state = run(state, toggleMark(schema.marks['bold']));
    expect(markActive(state, schema.marks['bold'])).toBe(true);
    state = run(state, toggleMark(schema.marks['bold']));
    expect(markActive(state, schema.marks['bold'])).toBe(false);
    expect(markActive(stateOf('<p><strong>ab</strong></p>', 2), schema.marks['bold'])).toBe(true);
    expect(markActive(select(stateOf('<p>a<strong>b</strong></p>'), 'b'), schema.marks['bold'])).toBe(true);
    expect(markAttrs(stateOf('<p>ab</p>', 2), schema.marks['bold'])).toBeNull();
    expect(toggleMark(schema.marks['bold'])(select(state, 'Hello'))).toBe(true);
    const code = stateOf('<pre><code>x</code></pre>');
    expect(toggleMark(schema.marks['bold'])(code)).toBe(false);
    expect(setTextStyle('color', 'red')(code)).toBe(false);
    expect(blockAttr(code, 'align')).toBeNull();
  });

  it('sets and removes a mark on the cursor and on a range', () => {
    const link = schema.marks['link'];
    let state = at(stateOf('<p>Hi</p>'), 'Hi', 2);
    state = run(state, setMark(link, { href: 'https://a.com' }));
    state = state.apply(state.tr.insertText('x'));
    expect(html(state)).toBe('<p>Hi<a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow">x</a></p>');
    state = run(selectRange(state, 1, 4), setMark(link, null));
    expect(html(state)).toBe('<p>Hix</p>');
    state = run(select(state, 'ix'), setMark(link, { href: '/page', target: null }));
    expect(html(state)).toBe('<p>H<a href="/page">ix</a></p>');
    state = run(at(state, 'H', 1), setMark(link, null));
    state = state.apply(state.tr.insertText('y'));
    expect(html(state)).toBe('<p>Hy<a href="/page">ix</a></p>');
    expect(setMark(link, null)(state)).toBe(true);
  });

  it('keeps a text style on the cursor and drops it when every value is cleared', () => {
    let state = at(stateOf('<p>Hi</p>'), 'Hi', 2);
    expect(setTextStyle('color', 'red')(state)).toBe(true);
    state = run(state, setTextStyle('color', 'red'));
    expect(markAttrs(state, schema.marks['text_style'])?.['color']).toBe('red');
    state = state.apply(state.tr.insertText('x'));
    state = run(state, setTextStyle('color', null));
    state = state.apply(state.tr.insertText('y'));
    expect(html(state)).toBe('<p>Hi<span style="color: red">x</span>y</p>');
    state = run(select(state, 'x'), setTextStyle('color', null));
    expect(html(state)).toBe('<p>Hixy</p>');
    expect(markAttrs(select(state, 'Hi'), schema.marks['text_style'])).toBeNull();
  });

  it('finds the whole link around the cursor', () => {
    const state = stateOf('<p><a href="https://a.com">one <strong>two</strong></a> end</p>');
    expect(linkRange(at(state, 'two', 1))).toEqual({ from: 1, to: 8, href: 'https://a.com' });
    expect(linkRange(at(state, 'two', 3))).toEqual({ from: 1, to: 8, href: 'https://a.com' });
    expect(linkRange(select(state, 'one'))).toEqual({ from: 1, to: 4, href: 'https://a.com' });
    expect(linkRange(at(state, 'one', 1))).toEqual({ from: 1, to: 8, href: 'https://a.com' });
    expect(linkRange(at(state, 'end', 2))).toBeNull();
    expect(linkRange(stateOf('<p>plain</p>'))).toBeNull();
    expect(linkRange(select(state, 'end'))).toBeNull();
  });
});

describe('block commands', () => {
  it('clears alignment and indent from plain paragraphs', () => {
    let state = stateOf('<p style="text-align: center">A</p><p data-indent="2">B</p><p dir="rtl">C</p>');
    expect(html(state)).toBe('<p style="text-align: center">A</p><p data-indent="2" style="margin-left: 6em">B</p><p dir="rtl">C</p>');
    expect(clearFormatting()(state)).toBe(true);
    state = run(state.apply(state.tr.setSelection(new AllSelection(state.doc))), clearFormatting());
    expect(html(state)).toBe('<p>A</p><p>B</p><p dir="rtl">C</p>');
  });

  it('checks the selected node and the block around the cursor', () => {
    const state = selectNode(stateOf('<hr><p>x</p>', 2), 0);
    expect(blockActive(state, schema.nodes['horizontal_rule'])).toBe(true);
    expect(blockActive(state, schema.nodes['paragraph'])).toBe(false);
    expect(blockActive(stateOf('<h2>x</h2>'), schema.nodes['heading'], { level: 2 })).toBe(true);
    expect(blockActive(stateOf('<h2>x</h2>'), schema.nodes['heading'], { level: 3 })).toBe(false);
  });

  it('sets the block type of every selected block and keeps the alignment of text blocks', () => {
    let state = stateOf('<p style="text-align: right">One</p><p>Two</p>');
    state = run(selectRange(state, 1, state.doc.content.size - 1), setBlockType(schema.nodes['heading'], { level: 2 }));
    expect(html(state)).toBe('<h2 style="text-align: right">One</h2><h2>Two</h2>');
    expect(setBlockType(schema.nodes['paragraph'])(selectNode(stateOf('<hr><p>x</p>', 2), 0))).toBe(false);
  });

  it('turns a quoted paragraph into code and back', () => {
    let state = stateOf('<blockquote><p>Q</p></blockquote>', 2);
    state = run(state, toggleBlockType(schema.nodes['code_block']));
    expect(html(state)).toBe('<blockquote><pre><code>Q</code></pre></blockquote>');
    expect(blockAttr(state, 'indent')).toBeNull();
    state = run(state, toggleBlockType(schema.nodes['code_block']));
    expect(html(state)).toBe('<blockquote><p>Q</p></blockquote>');
  });

  it('changes block attributes only when they differ', () => {
    let state = stateOf('<p>x</p>');
    expect(setBlockAttr('align', null)(state)).toBe(false);
    state = run(state, setBlockAttr('dir', 'rtl'));
    expect(html(state)).toBe('<p dir="rtl">x</p>');
    expect(blockAttr(state, 'dir')).toBe('rtl');
  });

  it('indents blocks inside wrappers, not list items, and stops at the limits', () => {
    let state = stateOf('<blockquote><p>Q</p></blockquote>', 2);
    state = run(state, shiftIndent(1));
    expect(html(state)).toBe('<blockquote><p data-indent="1" style="margin-left: 3em">Q</p></blockquote>');
    expect(shiftIndent(-1)(stateOf('<p>x</p>'))).toBe(false);
    expect(shiftIndent(1)(stateOf('<p data-indent="8">x</p>'))).toBe(false);
    expect(shiftIndent(1)(stateOf('<ul><li><p>x</p></li></ul>', 3))).toBe(false);
  });

  it('wraps only where the schema allows it', () => {
    const state = stateOf('<p>x</p>');
    expect(wrapIn(schema.nodes['code_block'])(state)).toBe(false);
    expect(toggleWrap(schema.nodes['callout'])(state)).toBe(true);
    const quote = stateOf('<blockquote><p>q</p></blockquote><p>after</p>', 2);
    expect(toggleWrap(schema.nodes['blockquote'])(selectRange(quote, 2, textPos(quote, 'after', 2)))).toBe(false);
    expect(html(run(state, toggleWrap(schema.nodes['callout'])))).toBe('<div data-type="callout" data-tone="info"><p>x</p></div>');
  });
});

describe('Backspace and Delete', () => {
  it('deletes a selection', () => {
    expect(html(run(select(stateOf('<p>Hello</p>'), 'ell'), keys['Backspace']))).toBe('<p>Ho</p>');
    expect(html(run(select(stateOf('<p>Hello</p>'), 'ell'), keys['Delete']))).toBe('<p>Ho</p>');
  });

  it('lifts out of a quote, outdents and turns headings into paragraphs at the start', () => {
    expect(html(run(stateOf('<blockquote><p>Q</p></blockquote>', 2), keys['Backspace']))).toBe('<p>Q</p>');
    expect(html(run(stateOf('<p data-indent="1">A</p>'), keys['Backspace']))).toBe('<p>A</p>');
    expect(html(run(stateOf('<h2>T</h2>'), keys['Backspace']))).toBe('<p>T</p>');
    expect(html(run(stateOf('<p>a</p><pre><code></code></pre>', 4), keys['Backspace']))).toBe('<p>a</p><p><br></p>');
  });

  it('joins with the block before or selects an atom before', () => {
    expect(html(run(stateOf('<p>a</p><pre><code>x</code></pre>', 4), keys['Backspace']))).toBe('<p>ax</p>');
    const beside = run(stateOf('<hr><p>x</p>', 2), keys['Backspace']);
    expect(beside.selection).toBeInstanceOf(NodeSelection);
    expect((beside.selection as NodeSelection).node.type.name).toBe('horizontal_rule');
    expect(html(beside)).toBe('<hr><p>x</p>');
    const empty = run(stateOf('<hr><p></p>', 2), keys['Backspace']);
    expect((empty.selection as NodeSelection).node.type.name).toBe('horizontal_rule');
    expect(empty.doc.childCount).toBe(1);
    expect(keys['Backspace'](stateOf('<p>a</p>'))).toBe(false);
    expect(keys['Backspace'](stateOf('<p>ab</p>', 2))).toBe(false);
  });

  it('joins with the next block or selects an atom after', () => {
    expect(html(run(stateOf('<p>a</p><p>b</p>', 2), keys['Delete']))).toBe('<p>ab</p>');
    const atom = run(stateOf('<p>a</p><hr>', 2), keys['Delete']);
    expect((atom.selection as NodeSelection).node.type.name).toBe('horizontal_rule');
    expect(keys['Delete'](stateOf('<p>a</p>', 2))).toBe(false);
    expect(keys['Delete'](stateOf('<p>ab</p>', 2))).toBe(false);
  });

  it('selects the whole document', () => {
    expect(run(stateOf('<p>a</p><p>b</p>'), keys['Mod-a']).selection).toBeInstanceOf(AllSelection);
  });
});

describe('Enter', () => {
  it('adds lines in code and leaves the block after two empty lines', () => {
    let state = stateOf('<pre><code>x</code></pre>', 2);
    state = run(state, keys['Enter']);
    state = run(state, keys['Enter']);
    expect(state.doc.textContent).toBe('x\n\n');
    state = run(state, keys['Enter']);
    expect(html(state)).toBe('<pre><code>x</code></pre><p><br></p>');
    expect(state.selection.$from.parent.type.name).toBe('paragraph');
  });

  it('leaves code with Mod-Enter', () => {
    const state = run(stateOf('<pre><code>x</code></pre>', 1), keys['Mod-Enter']);
    expect(html(state)).toBe('<pre><code>x</code></pre><p><br></p>');
    expect(keys['Mod-Enter'](stateOf('<p>x</p>'))).toBe(false);
  });

  it('lifts an empty block out of a quote and splits inside table cells', () => {
    expect(html(run(stateOf('<blockquote><p>a</p><p></p></blockquote>', 5), keys['Enter']))).toBe('<blockquote><p>a</p></blockquote><p><br></p>');
    const cell = run(stateOf('<table><tr><td><p></p></td></tr></table>', 4), keys['Enter']);
    expect(html(cell)).toBe('<table><tbody><tr><td><p><br></p><p><br></p></td></tr></tbody></table>');
  });

  it('splits a plain paragraph', () => {
    expect(html(run(stateOf('<p>ab</p>', 2), keys['Enter']))).toBe('<p>a</p><p>b</p>');
  });

  it('splits selections, headings, code and marked text', () => {
    expect(html(run(select(stateOf('<p>Hello</p>'), 'll'), splitBlock))).toBe('<p>He</p><p>o</p>');
    expect(html(run(stateOf('<h1>Hello</h1>', 3), splitBlock))).toBe('<h1>He</h1><h1>llo</h1>');
    expect(html(run(stateOf('<pre><code>ab</code></pre>', 2), splitBlock))).toBe('<pre><code>a</code></pre><pre><code>b</code></pre>');
    expect(html(run(stateOf('<p>ab</p>'), splitBlock))).toBe('<p><br></p><p>ab</p>');
    expect(html(run(stateOf('<p style="text-align: center">ab</p>', 3), splitBlock))).toBe('<p style="text-align: center">ab</p><p style="text-align: center"><br></p>');
    let marked = at(stateOf('<p><strong>ab</strong></p>'), 'ab', 2);
    marked = run(marked, splitBlock);
    marked = marked.apply(marked.tr.insertText('c'));
    expect(html(marked)).toBe('<p><strong>ab</strong></p><p><strong>c</strong></p>');
    let stored = run(at(stateOf('<p>ab</p>'), 'ab', 1), toggleMark(schema.marks['italic']));
    stored = run(stored, splitBlock);
    stored = stored.apply(stored.tr.insertText('c'));
    expect(html(stored)).toBe('<p>a</p><p><em>c</em>b</p>');
    expect(splitBlock(selectNode(stateOf('<hr><p>x</p>', 2), 0))).toBe(false);
  });

  it('adds hard breaks outside code', () => {
    expect(html(run(stateOf('<p>ab</p>', 2), keys['Shift-Enter']))).toBe('<p>a<br>b</p>');
    expect(keys['Shift-Enter'](stateOf('<pre><code>ab</code></pre>', 2))).toBe(false);
  });
});

describe('checking commands without applying them', () => {
  it('answers whether Backspace, Delete, Enter and code commands apply', () => {
    expect(keys['Backspace'](stateOf('<hr><p>x</p>', 2))).toBe(true);
    expect(keys['Backspace'](stateOf('<p>a</p><p>b</p>', 4))).toBe(true);
    expect(keys['Delete'](stateOf('<p>a</p><hr>', 2))).toBe(true);
    expect(keys['Delete'](stateOf('<p>a</p><p>b</p>', 2))).toBe(true);
    expect(keys['Enter'](stateOf('<pre><code>x\n\n</code></pre>', 4))).toBe(true);
    expect(keys['Mod-Enter'](stateOf('<pre><code>x</code></pre>'))).toBe(true);
    expect(splitBlock(stateOf('<h1>Title</h1>'))).toBe(true);
    expect(splitBlock(stateOf('<p>ab</p>', 2))).toBe(true);
    expect(sinkListItem()(stateOf('<ul><li><p>a</p></li><li><p>b</p></li></ul>', 8))).toBe(true);
  });
});

describe('insertNode', () => {
  it('replaces the selection with inline nodes and with blocks over a range', () => {
    const mention = schema.nodes['mention'].create({ id: '1', label: 'Ann' });
    expect(insertNode(mention)(stateOf('<p>ab</p>'))).toBe(true);
    expect(html(run(stateOf('<p>ab</p>', 2), insertNode(mention)))).toBe('<p>a<span data-type="mention" data-id="1" data-label="Ann">@Ann</span>b</p>');
    const rule = schema.nodes['horizontal_rule'].create();
    expect(html(run(select(stateOf('<p>abc</p>'), 'b'), insertNode(rule)))).toBe('<p>a</p><hr><p>c</p>');
  });
});

describe('lists', () => {
  it('converts between list kinds and refuses code blocks', () => {
    let state = stateOf('<ul><li><p>a</p></li></ul>', 3);
    state = run(state, toggleList(schema.nodes['ordered_list']));
    expect(html(state)).toBe('<ol><li><p>a</p></li></ol>');
    expect(currentList(state)?.node.type.name).toBe('ordered_list');
    state = run(state, toggleList(schema.nodes['task_list']));
    expect(html(state)).toContain('<ul data-type="taskList"><li data-type="taskItem" data-checked="false">');
    state = run(state, toggleList(schema.nodes['bullet_list']));
    expect(html(state)).toBe('<ul><li><p>a</p></li></ul>');
    expect(toggleList(schema.nodes['bullet_list'])(stateOf('<pre><code>x</code></pre>'))).toBe(false);
    expect(currentList(stateOf('<p>x</p>'))).toBeNull();
  });

  it('splits items in the middle and task items unchecked', () => {
    expect(html(run(stateOf('<ul><li><p>ab</p></li></ul>', 4), keys['Enter']))).toBe('<ul><li><p>a</p></li><li><p>b</p></li></ul>');
    const task = run(stateOf('<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><div><p>ab</p></div></li></ul>', 5), keys['Enter']);
    expect(html(task)).toContain('<li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>ab</p></div></li><li data-type="taskItem" data-checked="false">');
  });

  it('refuses to split node selections, other item types and top-level blocks', () => {
    const hr = selectNode(stateOf('<ul><li><p>a</p><hr></li></ul>', 3), 5);
    expect(splitListItem()(hr)).toBe(false);
    expect(splitListItem(schema.nodes['task_item'])(stateOf('<ul><li><p>a</p></li></ul>', 3))).toBe(false);
    expect(splitListItem(schema.nodes['list_item'])(stateOf('<p>a</p>'))).toBe(false);
  });

  it('lifts an empty last item out of the list on Enter', () => {
    expect(html(run(stateOf('<ul><li><p>a</p></li><li><p></p></li></ul>', 8), keys['Enter']))).toBe('<ul><li><p>a</p></li></ul><p><br></p>');
  });

  it('sinks into the nested list of the item before', () => {
    const state = stateOf('<ul><li><p>a</p><ul><li><p>b</p></li></ul></li><li><p>c</p></li></ul>');
    expect(html(run(at(state, 'c'), keys['Tab']))).toBe('<ul><li><p>a</p><ul><li><p>b</p></li><li><p>c</p></li></ul></li></ul>');
    expect(sinkListItem()(at(state, 'a'))).toBe(false);
    expect(sinkListItem()(stateOf('<p>x</p>'))).toBe(false);
    const outside = stateOf('<ul><li><p>a</p></li><li><p>b</p></li></ul><p>after</p>');
    const spanning = selectRange(outside, textPos(outside, 'b'), textPos(outside, 'after', 2));
    expect(sinkListItem()(spanning)).toBe(false);
    expect(liftListItem()(spanning)).toBe(false);
    expect(keys['Tab'](stateOf('<p>x</p>'))).toBe(false);
  });

  it('lifts a nested item with the items after it', () => {
    const state = stateOf('<ul><li><p>a</p><ul><li><p>b</p></li><li><p>c</p></li></ul></li></ul>');
    expect(html(run(at(state, 'b'), keys['Shift-Tab']))).toBe('<ul><li><p>a</p></li><li><p>b</p><ul><li><p>c</p></li></ul></li></ul>');
    expect(html(run(at(state, 'c'), keys['Mod-[']))).toBe('<ul><li><p>a</p><ul><li><p>b</p></li></ul></li><li><p>c</p></li></ul>');
  });

  it('lifts middle items and whole ranges out of the list', () => {
    const state = stateOf('<ul><li><p>a</p></li><li><p>b</p></li><li><p>c</p></li></ul>');
    expect(html(run(at(state, 'b'), liftListItem()))).toBe('<ul><li><p>a</p></li></ul><p>b</p><ul><li><p>c</p></li></ul>');
    const all = selectRange(state, textPos(state, 'a'), textPos(state, 'c', 1));
    expect(html(run(all, liftListItem()))).toBe('<p>a</p><p>b</p><p>c</p>');
    expect(liftListItem()(at(state, 'b'))).toBe(true);
    expect(liftListItem()(stateOf('<p>x</p>'))).toBe(false);
  });

  it('lifts the first item on Backspace and joins later paragraphs of an item', () => {
    expect(html(run(stateOf('<ul><li><p>a</p></li></ul>', 3), keys['Backspace']))).toBe('<p>a</p>');
    expect(html(run(stateOf('<ul><li><p>a</p><p>b</p></li></ul>', 6), keys['Backspace']))).toBe('<ul><li><p>ab</p></li></ul>');
  });

  it('indents lists and plain blocks with the bracket keys', () => {
    const list = stateOf('<ul><li><p>a</p></li><li><p>b</p></li></ul>');
    expect(html(run(at(list, 'b'), keys['Mod-]']))).toBe('<ul><li><p>a</p><ul><li><p>b</p></li></ul></li></ul>');
    expect(html(run(stateOf('<p>x</p>'), keys['Mod-]']))).toBe('<p data-indent="1" style="margin-left: 3em">x</p>');
    expect(html(run(stateOf('<p data-indent="1">x</p>'), keys['Mod-[']))).toBe('<p>x</p>');
  });

  it('toggles a task item', () => {
    const state = stateOf('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><div><p>a</p></div></li></ul>');
    expect(html(run(state, toggleTask(1)))).toContain('data-checked="true"');
    expect(toggleTask(0)(state)).toBe(false);
  });
});

describe('history', () => {
  it('starts a new step after a close and forgets everything on a silent change', () => {
    let state = stateOf('<p>a</p>', 2);
    state = state.apply(state.tr.insertText('b'));
    state = state.apply(closeHistory(state.tr));
    state = state.apply(state.tr.insertText('c'));
    expect(undo(state)).toBe(true);
    state = run(state, undo);
    expect(state.doc.textContent).toBe('ab');
    expect(canRedo(state)).toBe(true);
    state = state.apply(state.tr.insertText('z', 1).setMeta('addToHistory', false));
    expect(canUndo(state)).toBe(false);
    expect(canRedo(state)).toBe(false);
    expect(undo(state)).toBe(false);
    expect(redo(state)).toBe(false);
    state = state.apply(state.tr.insertText('y', 1));
    expect(canUndo(state)).toBe(true);
    state = state.apply(state.tr.setMeta(historyKey, 'reset'));
    expect(canUndo(state)).toBe(false);
  });
});

describe('keys', () => {
  const key = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);

  it('names digits, symbols, modifiers and named keys', () => {
    expect(keyName(key({ key: '1', code: 'Digit1', ctrlKey: true, altKey: true }), false)).toBe('Mod-Alt-1');
    expect(keyName(key({ key: ',', code: 'Comma', metaKey: true }), true)).toBe('Mod-,');
    expect(keyName(key({ key: 'б', code: 'Comma' }), false)).toBe('б');
    expect(keyName(key({ key: 'Enter', code: 'Enter', ctrlKey: true }), true)).toBe('Ctrl-Enter');
    expect(keyName(key({ key: 'Tab', code: 'Tab', shiftKey: true }), false)).toBe('Shift-Tab');
  });

  it('reads the platform from the browser', () => {
    const platform = vi.spyOn(navigator, 'platform', 'get');
    platform.mockReturnValue('MacIntel');
    expect(isMac()).toBe(true);
    platform.mockReturnValue(undefined as unknown as string);
    expect(isMac()).toBe(false);
    platform.mockRestore();
  });

  it('runs bound commands, skips composition and opens the link form', () => {
    const openLink = vi.fn();
    const plugin = keymap({ 'Mod-b': toggleMark(schema.marks['bold']), 'Shift-Mod-K': () => true });
    const view = new EditorView(document.createElement('div'), { state: select(stateOf('<p>ab</p>'), 'a'), plugins: [plugin] });
    const press = (init: KeyboardEventInit) => view.someProp('handleKeyDown', (handler) => handler(view, key(init)));
    expect(press({ key: 'b', code: 'KeyB', ctrlKey: true, isComposing: true })).toBeFalsy();
    expect(press({ key: 'b', code: 'KeyB', ctrlKey: true })).toBe(true);
    expect(html(view.state)).toBe('<p><strong>a</strong>b</p>');
    expect(press({ key: 'K', code: 'KeyK', ctrlKey: true, shiftKey: true })).toBe(true);
    expect(press({ key: 'q', code: 'KeyQ' })).toBeFalsy();
    view.destroy();
    expect(editorKeymap(openLink)['Mod-k'](stateOf('<p>a</p>'))).toBe(true);
    expect(openLink).toHaveBeenCalledTimes(1);
    expect(chain(() => false, () => false)(stateOf('<p>a</p>'))).toBe(false);
  });
});

describe('html', () => {
  it('parses nothing into an empty paragraph and serializes fragments', () => {
    expect(html(EditorState.create({ schema, doc: parseHtml(null, document) }))).toBe('');
    const doc = parseHtml('<p>a <strong>b</strong></p>', document);
    expect(serializeFragment(doc.content, document)).toBe('<p>a <strong>b</strong></p>');
  });
});
