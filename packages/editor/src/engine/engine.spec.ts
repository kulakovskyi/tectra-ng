import { Command, EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { clearFormatting, insertNode, joinBackward, setBlockAttr, setTextStyle, shiftIndent, splitBlock, toggleBlockType, toggleMark, toggleWrap } from './commands';
import { redo, undo } from './history';
import { parseHtml, serializeHtml } from './html';
import { keyName } from './keymap';
import { liftListItem, sinkListItem, splitListItem, toggleList } from './lists';
import { editorKeymap, editorPlugins } from './setup';
import { toVideoEmbed, txEditorSchema as schema } from './schema';

function stateOf(html: string, plugins = editorPlugins(options())): EditorState {
  return EditorState.create({ schema, doc: parseHtml(html, document), plugins });
}

function options() {
  return {
    placeholder: () => 'Write',
    maxLength: () => undefined,
    linkTarget: () => '_blank',
    triggers: () => [],
    suggestion: { change: () => undefined, keydown: () => false },
    openLink: () => undefined,
  };
}

function at(state: EditorState, text: string, offset = 0): EditorState {
  let found = -1;
  state.doc.descendants((node, pos) => {
    if (found === -1 && node.isText && node.text?.includes(text)) {
      found = pos + (node.text?.indexOf(text) ?? 0) + offset;
    }
    return found === -1;
  });
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, found)));
}

function select(state: EditorState, text: string): EditorState {
  const start = at(state, text).selection.from;
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, start, start + text.length)));
}

function run(state: EditorState, command: Command): EditorState {
  let next = state;
  command(state, (tr) => (next = state.apply(tr)));
  return next;
}

const html = (state: EditorState) => serializeHtml(state.doc, document).replace(/;"/g, '"');

describe('editor engine', () => {
  it('parses and serializes clean and Quill HTML', () => {
    expect(html(stateOf('<p>Plain <strong>bold</strong></p>'))).toBe('<p>Plain <strong>bold</strong></p>');
    expect(html(stateOf('<ol><li data-list="bullet">One</li><li data-list="ordered">Two</li></ol>'))).toBe('<ul><li><p>One</p></li></ul><ol><li><p>Two</p></li></ol>');
    expect(html(stateOf('<p class="ql-align-center ql-indent-1">Mid</p>'))).toBe('<p data-indent="1" style="text-align: center; margin-left: 3em">Mid</p>');
    expect(html(stateOf('<p></p>'))).toBe('');
    expect(html(stateOf('<p><span style="color: red">x</span><img src="javascript:alert(1)"><a href="javascript:x">y</a></p>'))).toBe('<p><span style="color: red">x</span>y</p>');
  });

  it('toggles marks on a selection and on the cursor', () => {
    let state = select(stateOf('<p>Hello world</p>'), 'world');
    state = run(state, toggleMark(schema.marks['bold']));
    expect(html(state)).toBe('<p>Hello <strong>world</strong></p>');
    state = run(state, toggleMark(schema.marks['bold']));
    expect(html(state)).toBe('<p>Hello world</p>');
    state = at(state, 'Hello', 5);
    state = run(state, toggleMark(schema.marks['italic']));
    state = state.apply(state.tr.insertText('!'));
    expect(html(state)).toBe('<p>Hello<em>!</em> world</p>');
  });

  it('merges text styles and clears formatting', () => {
    let state = select(stateOf('<h2 style="text-align: center">Title text</h2>'), 'text');
    state = run(state, setTextStyle('color', 'rgb(220, 38, 38)'));
    state = run(state, setTextStyle('background', 'rgba(1, 2, 3, 0.2)'));
    expect(html(state)).toBe('<h2 style="text-align: center">Title <span style="color: rgb(220, 38, 38); background-color: rgba(1, 2, 3, 0.2)">text</span></h2>');
    state = run(state, setTextStyle('color', null));
    expect(html(state)).toContain('<span style="background-color: rgba(1, 2, 3, 0.2)">text</span>');
    state = state.apply(state.tr.setSelection(TextSelection.create(state.doc, 1, (state.doc.firstChild?.nodeSize ?? 2) - 1)));
    state = run(state, clearFormatting());
    expect(html(state)).toBe('<p>Title text</p>');
  });

  it('changes blocks, alignment, indent and quotes', () => {
    let state = at(stateOf('<p>Line</p>'), 'Line');
    state = run(state, toggleBlockType(schema.nodes['heading'], { level: 3 }));
    expect(html(state)).toBe('<h3>Line</h3>');
    state = run(state, setBlockAttr('align', 'right'));
    state = run(state, shiftIndent(1));
    expect(html(state)).toBe('<h3 data-indent="1" style="text-align: right; margin-left: 3em">Line</h3>');
    state = run(state, toggleBlockType(schema.nodes['heading'], { level: 3 }));
    expect(html(state)).toBe('<p data-indent="1" style="text-align: right; margin-left: 3em">Line</p>');
    state = run(state, toggleWrap(schema.nodes['blockquote']));
    expect(html(state)).toContain('<blockquote><p');
    state = run(state, toggleWrap(schema.nodes['blockquote']));
    expect(html(state)).not.toContain('blockquote');
  });

  it('adds a paragraph above when Enter is pressed at the start of a heading', () => {
    let state = at(stateOf('<h1>Title</h1>'), 'Title');
    state = run(state, splitBlock);
    expect(html(state)).toBe('<p><br></p><h1>Title</h1>');
    expect(state.selection.$from.parent.type.name).toBe('heading');
  });

  it('splits blocks, leaves headings with a paragraph and joins back', () => {
    let state = at(stateOf('<h1>Title</h1>'), 'Title', 5);
    state = run(state, splitBlock);
    state = state.apply(state.tr.insertText('Body'));
    expect(html(state)).toBe('<h1>Title</h1><p>Body</p>');
    state = at(state, 'Body');
    state = run(state, joinBackward);
    expect(html(state)).toBe('<h1>TitleBody</h1>');
  });

  it('wraps, splits, nests, lifts and converts lists', () => {
    let state = at(stateOf('<p>One</p>'), 'One', 3);
    state = run(state, toggleList(schema.nodes['bullet_list']));
    expect(html(state)).toBe('<ul><li><p>One</p></li></ul>');
    state = run(state, splitListItem());
    state = state.apply(state.tr.insertText('Two'));
    expect(html(state)).toBe('<ul><li><p>One</p></li><li><p>Two</p></li></ul>');
    state = run(state, sinkListItem());
    expect(html(state)).toBe('<ul><li><p>One</p><ul><li><p>Two</p></li></ul></li></ul>');
    state = run(state, liftListItem());
    expect(html(state)).toBe('<ul><li><p>One</p></li><li><p>Two</p></li></ul>');
    state = run(state, toggleList(schema.nodes['task_list']));
    expect(html(state)).toContain('<ul data-type="taskList"><li data-type="taskItem" data-checked="false">');
    state = run(state, toggleList(schema.nodes['task_list']));
    expect(html(state)).toBe('<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><label><input type="checkbox"><span></span></label><div><p>One</p></div></li></ul><p>Two</p>');
  });

  it('inserts blocks before, after, instead of or inside a paragraph', () => {
    const image = () => schema.nodes['image'].create({ src: 'https://example.com/a.png' });
    const img = '<img src="https://example.com/a.png">';
    expect(html(run(at(stateOf('<p>Text</p>'), 'Text'), insertNode(image())))).toBe(`${img}<p>Text</p>`);
    expect(html(run(at(stateOf('<p>Text</p>'), 'Text', 4), insertNode(image())))).toBe(`<p>Text</p>${img}<p><br></p>`);
    expect(html(run(at(stateOf('<p>Te</p><p>Next</p>'), 'Te', 1), insertNode(image())))).toBe(`<p>T</p>${img}<p>e</p><p>Next</p>`);
    const empty = stateOf('<p>One</p><p></p><p>Two</p>');
    expect(html(run(empty.apply(empty.tr.setSelection(TextSelection.create(empty.doc, 6))), insertNode(image())))).toBe(`<p>One</p>${img}<p>Two</p>`);
  });

  it('undoes and redoes typing and commands', () => {
    let state = at(stateOf('<p>Text</p>'), 'Text', 4);
    state = state.apply(state.tr.insertText(' more'));
    state = run(select(state, 'more'), toggleMark(schema.marks['bold']));
    expect(html(state)).toBe('<p>Text <strong>more</strong></p>');
    state = run(state, undo);
    expect(html(state)).toBe('<p>Text more</p>');
    state = run(state, redo);
    expect(html(state)).toBe('<p>Text <strong>more</strong></p>');
  });

  it('names keys by position so shortcuts work on any layout', () => {
    expect(keyName(new KeyboardEvent('keydown', { key: 'и', code: 'KeyB', ctrlKey: true }), false)).toBe('Mod-b');
    expect(keyName(new KeyboardEvent('keydown', { key: 'Z', code: 'KeyZ', metaKey: true, shiftKey: true }), true)).toBe('Mod-Shift-z');
    expect(keyName(new KeyboardEvent('keydown', { key: 'х', code: 'BracketLeft', ctrlKey: true }), false)).toBe('Mod-[');
    expect(Object.keys(editorKeymap(() => undefined))).toContain('Mod-Alt-3');
  });

  describe('in a view', () => {
    let view: EditorView;
    const type = (text: string) => {
      for (const char of text) {
        const { from, to } = view.state.selection;
        const handled = view.someProp('handleTextInput', (handler) => handler(view, from, to, char, () => view.state.tr.insertText(char, from, to)));
        if (!handled) {
          view.dispatch(view.state.tr.insertText(char, from, to));
        }
      }
    };

    beforeEach(() => {
      const empty = stateOf('<p></p>');
      view = new EditorView(document.createElement('div'), { state: empty.apply(empty.tr.setSelection(TextSelection.create(empty.doc, 1))) });
    });

    afterEach(() => view.destroy());

    it('applies Markdown shortcuts', () => {
      type('## ');
      type('Heading');
      expect(html(view.state)).toBe('<h2>Heading</h2>');
      view.dispatch(view.state.tr.insertText('', 0).replaceWith(0, view.state.doc.content.size, schema.nodes['paragraph'].create()));
      view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 1)));
      type('- item **bold** and `code` ');
      expect(html(view.state)).toBe('<ul><li><p>item <strong>bold</strong> and <code>code</code> </p></li></ul>');
    });

    it('turns typed URLs into links', () => {
      type('see example.com ');
      expect(html(view.state)).toBe('<p>see <a href="https://example.com" target="_blank" rel="noopener noreferrer nofollow">example.com</a> </p>');
    });

    it('shows the placeholder only in an empty document', () => {
      expect(view.dom.querySelector('.tx-editor__placeholder')?.getAttribute('data-placeholder')).toBe('Write');
      type('a');
      expect(view.dom.querySelector('.tx-editor__placeholder')).toBeNull();
    });
  });
});

describe('toVideoEmbed', () => {
  it('turns YouTube and Vimeo links into embed addresses', () => {
    expect(toVideoEmbed('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(toVideoEmbed('youtube.com/watch?feature=share&t=10&v=dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(toVideoEmbed('https://youtu.be/dQw4w9WgXcQ?t=5')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
    expect(toVideoEmbed('https://www.youtube.com/shorts/abcdef12')).toBe('https://www.youtube.com/embed/abcdef12');
    expect(toVideoEmbed('https://www.youtube-nocookie.com/embed/abcdefg')).toBe('https://www.youtube.com/embed/abcdefg');
    expect(toVideoEmbed('https://vimeo.com/76979871')).toBe('https://player.vimeo.com/video/76979871');
    expect(toVideoEmbed('https://player.vimeo.com/video/76979871')).toBe('https://player.vimeo.com/video/76979871');
  });

  it('keeps other https links and drops the rest', () => {
    expect(toVideoEmbed('https://example.com/video.mp4')).toBe('https://example.com/video.mp4');
    expect(toVideoEmbed('http://example.com/video.mp4')).toBeNull();
    expect(toVideoEmbed('javascript:alert(1)')).toBeNull();
    expect(toVideoEmbed('https://notyoutube.com/watch?v=dQw4w9WgXcQ')).toBe('https://notyoutube.com/watch?v=dQw4w9WgXcQ');
  });

  it('answers fast on a long hostile string', () => {
    const start = Date.now();
    toVideoEmbed(`https://youtube.com/watch?${'a&'.repeat(50000)}`);
    expect(Date.now() - start).toBeLessThan(200);
  });
});
