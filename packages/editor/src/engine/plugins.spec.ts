import type { Mock } from 'vitest';
import { EditorState, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { aiKey } from './ai';
import { parseHtml, serializeHtml } from './html';
import { TxSuggestionMatch, TxSuggestionTrigger, normalizeHref, selectionText, suggestionKey, textLength } from './plugins';
import { editorKeymap, editorPlugins } from './setup';
import { txEditorSchema as schema } from './schema';

interface Handlers {
  change: (match: TxSuggestionMatch | null) => void;
  keydown: (event: KeyboardEvent) => boolean;
}

function plugins(triggers: readonly TxSuggestionTrigger[] = [], handlers: Handlers = { change: () => undefined, keydown: () => false }) {
  return editorPlugins({
    placeholder: () => '',
    maxLength: () => undefined,
    linkTarget: () => '_blank',
    triggers: () => triggers,
    suggestion: handlers,
    openLink: () => undefined,
    typography: { enabled: () => true, quotes: () => ['“', '”', '‘', '’'] as const },
  });
}

function stateOf(html: string, cursor = 1, extra = plugins()): EditorState {
  const state = EditorState.create({ schema, doc: parseHtml(html, document), plugins: extra });
  return state.apply(state.tr.setSelection(TextSelection.create(state.doc, cursor)));
}

const html = (state: EditorState) => serializeHtml(state.doc, document).replace(/;"/g, '"');
const roundTrip = (source: string) => html(stateOf(source));

describe('schema', () => {
  it('reads and writes block attributes, code languages, rules and lists', () => {
    expect(roundTrip('<h3 style="margin-left: 6em">T</h3>')).toBe('<h3 data-indent="2" style="margin-left: 6em">T</h3>');
    expect(roundTrip('<p style="text-align: left">L</p>')).toBe('<p>L</p>');
    expect(roundTrip('<pre><code class="language-ts">let a;</code></pre><pre>plain</pre>')).toBe('<pre><code class="language-ts">let a;</code></pre><pre><code>plain</code></pre>');
    expect(roundTrip('<hr><p>x</p>')).toBe('<hr><p>x</p>');
    expect(roundTrip('<ol start="3"><li><p>a</p></li></ol><ol start="x"><li><p>b</p></li></ol>')).toBe('<ol start="3"><li><p>a</p></li></ol><ol><li><p>b</p></li></ol>');
    expect(roundTrip('<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><p>done</p></li></ul>')).toBe(
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox" checked="checked"><span></span></label><div><p>done</p></div></li></ul>',
    );
    expect(roundTrip('<div data-type="callout"><p>c</p></div>')).toBe('<div data-type="callout" data-tone="info"><p>c</p></div>');
    expect(roundTrip('<table><tr><th colwidth="80">H</th><td>C</td></tr></table>')).toBe(
      '<table><tbody><tr><th data-colwidth="80" style="width: 80px"><p>H</p></th><td><p>C</p></td></tr></tbody></table>',
    );
  });

  it('keeps safe images and videos only', () => {
    expect(roundTrip('<img src="https://a.com/x.png" alt="X" title="T" width="40"><img src="ftp://a.com/x.png">')).toBe('<img src="https://a.com/x.png" alt="X" title="T" width="40">');
    expect(roundTrip('<iframe src="https://youtu.be/dQw4w9WgXcQ"></iframe><iframe src="javascript:alert(1)"></iframe>')).toBe(
      '<iframe data-type="video" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen="true" allow="encrypted-media; picture-in-picture; fullscreen"></iframe>',
    );
  });

  it('reads mentions with and without labels', () => {
    const state = stateOf('<p><span data-type="mention" data-id="1" data-label="Ann">@Ann</span> <span data-type="mention" data-id="2">@Bob</span> <span data-type="mention">@Nobody</span><br>x</p>');
    expect(html(state)).toBe('<p><span data-type="mention" data-id="1" data-label="Ann">@Ann</span> <span data-type="mention" data-id="2" data-label="Bob">@Bob</span> @Nobody<br>x</p>');
    expect(state.doc.textContent).toBe('@Ann @Bob @Nobodyx');
    expect(textLength(state.doc)).toBe(13);
  });

  it('reads links, weights, decorations and styles', () => {
    expect(roundTrip('<p><a href="https://a.com" target="_blank">a</a> <a href="/b" target="_self" rel="x">b</a> <a href="javascript:x">c</a></p>')).toBe(
      '<p><a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow">a</a> <a href="/b">b</a> c</p>',
    );
    expect(roundTrip('<p><b>b</b><b style="font-weight: normal">n</b><span style="font-weight: 700">w</span><span style="font-weight: 400">l</span></p>')).toBe(
      '<p><strong>b</strong>n<strong>w</strong>l</p>',
    );
    expect(roundTrip('<p><span style="text-decoration: underline">u</span><span style="text-decoration: line-through">s</span><span style="text-decoration: overline">o</span><del>d</del></p>')).toBe(
      '<p><u>u</u><s>s</s>o<s>d</s></p>',
    );
    expect(roundTrip('<p><sub>1</sub><sup>2</sup><i>i</i></p>')).toBe('<p><sub>1</sub><sup>2</sup><em>i</em></p>');
    expect(roundTrip('<p><span style="background-color: red">a</span><span style="font-size: 2em; font-family: serif">b</span></p>')).toBe(
      '<p><span style="background-color: red">a</span><span style="font-size: 2em; font-family: serif">b</span></p>',
    );
    expect(roundTrip('<p><mark>m</mark><mark style="color: blue; background-color: green">n</mark></p>')).toBe(
      '<p><span style="background-color: rgba(234, 179, 8, 0.28)">m</span><span style="color: blue; background-color: green">n</span></p>',
    );
  });
});

describe('links', () => {
  it('normalizes addresses, mails and phones', () => {
    expect(normalizeHref(' https://a.com ')).toBe('https://a.com');
    expect(normalizeHref('/docs')).toBe('/docs');
    expect(normalizeHref('#top')).toBe('#top');
    expect(normalizeHref('ann@example.com')).toBe('mailto:ann@example.com');
    expect(normalizeHref('+1 (555) 123-45')).toBe('tel:+155512345');
    expect(normalizeHref('example.com')).toBe('https://example.com');
  });

  it('links pasted text and leaves code and existing links alone', () => {
    let state = stateOf('<p>x</p>', 2);
    state = state.apply(state.tr.insertText(' see a.com and ann@example.com', 2).setMeta('uiEvent', 'paste'));
    expect(html(state)).toBe(
      '<p>x see <a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow">a.com</a> and <a href="mailto:ann@example.com" target="_blank" rel="noopener noreferrer nofollow">ann@example.com</a></p>',
    );
    let list = stateOf('<ul><li><p>x</p></li></ul>', 4);
    list = list.apply(list.tr.insertText(' a.com', 4).setMeta('uiEvent', 'drop'));
    expect(html(list)).toBe('<ul><li><p>x <a href="https://a.com" target="_blank" rel="noopener noreferrer nofollow">a.com</a></p></li></ul>');
    let code = stateOf('<pre><code>a.com</code></pre>', 6);
    code = code.apply(code.tr.insertText(' ', 6));
    expect(html(code)).toBe('<pre><code>a.com </code></pre>');
    let marked = stateOf('<p><code>a.com</code></p>', 6);
    marked = marked.apply(marked.tr.insertText(' ', 6));
    expect(html(marked)).toBe('<p><code>a.com </code></p>');
    let linked = stateOf('<p><a href="https://b.com">a.com</a></p>', 6);
    linked = linked.apply(linked.tr.insertText(' ', 6));
    expect(html(linked)).toBe('<p><a href="https://b.com">a.com</a> </p>');
    let silent = stateOf('<p>x</p>', 2);
    silent = silent.apply(silent.tr.insertText(' a.com ', 2).setMeta('addToHistory', false));
    expect(html(silent)).toBe('<p>x a.com </p>');
  });

  it('links only the word before the typed space', () => {
    let state = stateOf('<p>a.com b.com</p>', 12);
    state = state.apply(state.tr.insertText(' ', 12));
    expect(html(state)).toBe('<p>a.com <a href="https://b.com" target="_blank" rel="noopener noreferrer nofollow">b.com</a> </p>');
    expect(selectionText(state.apply(state.tr.setSelection(TextSelection.create(state.doc, 1, 6))))).toBe('a.com');
  });
});

describe('typing in a view', () => {
  let view: EditorView;
  let changes: (TxSuggestionMatch | null)[];
  let keydown: Mock<(event: KeyboardEvent) => boolean>;
  const triggers: TxSuggestionTrigger[] = [{ kind: 'mention', char: '@', minLength: 0 }];
  const type = (text: string) => {
    for (const char of text) {
      const { from, to } = view.state.selection;
      const handled = view.someProp('handleTextInput', (handler) => handler(view, from, to, char, () => view.state.tr.insertText(char, from, to)));
      if (!handled) {
        view.dispatch(view.state.tr.insertText(char, from, to));
      }
    }
  };
  const press = (key: string) => view.someProp('handleKeyDown', (handler) => handler(view, new KeyboardEvent('keydown', { key, code: key })));
  const mount = (source: string, cursor = 1) => {
    view?.destroy();
    changes = [];
    keydown = vi.fn<(event: KeyboardEvent) => boolean>(() => true);
    view = new EditorView(document.createElement('div'), { state: stateOf(source, cursor, plugins(triggers, { change: (match) => changes.push(match), keydown })) });
    view.hasFocus = () => true;
  };

  afterEach(() => view.destroy());

  it('replaces arrows and trademarks, and Backspace after moving deletes normally', () => {
    mount('<p></p>');
    type('a <- b (tm)');
    expect(view.state.doc.textContent).toBe('a ← b ™');
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 2)));
    expect(editorKeymap(() => undefined)['Backspace'](view.state, view.dispatch)).toBe(false);
  });

  it('skips rules while composing and inside code', () => {
    mount('<p></p>');
    Object.defineProperty(view, 'composing', { get: () => true });
    type('## ');
    expect(html(view.state)).toBe('<p>## </p>');
    mount('<pre><code></code></pre>');
    type('## ');
    expect(html(view.state)).toBe('<pre><code>## </code></pre>');
  });

  it('keeps headings and quotes out of list items', () => {
    mount('<ul><li><p></p></li></ul>', 3);
    type('# ');
    expect(html(view.state)).toBe('<ul><li><p># </p></li></ul>');
    mount('<ul><li><p></p></li></ul>', 3);
    type('> ');
    expect(html(view.state)).toBe('<ul><li><p>&gt; </p></li></ul>');
  });

  it('joins a new list with the list before and reads numbers and languages', () => {
    mount('<ul><li><p>a</p></li></ul><p></p>', 8);
    type('- b');
    expect(html(view.state)).toBe('<ul><li><p>a</p></li><li><p>b</p></li></ul>');
    mount('<p></p>');
    type('3. c');
    expect(html(view.state)).toBe('<ol start="3"><li><p>c</p></li></ol>');
    mount('<p></p>');
    type('```ts ');
    expect(html(view.state)).toBe('<pre><code class="language-ts"></code></pre>');
    mount('<p></p>');
    type('``` x');
    expect(html(view.state)).toBe('<pre><code>x</code></pre>');
  });

  it('turns dashes into a rule only in an otherwise empty paragraph', () => {
    mount('<p></p>');
    type('---');
    expect(html(view.state)).toBe('<hr><p><br></p>');
    mount('<h2></h2>');
    type('---');
    expect(view.state.doc.textContent).toBe('---');
    mount('<p>x</p>');
    type('***');
    expect(html(view.state)).toBe('<p>***x</p>');
  });

  it('reports, dismisses and forwards keys of suggestions', () => {
    mount('<p></p>');
    expect(press('ArrowDown')).toBeFalsy();
    type('Hi @');
    expect(changes.at(-1)).toMatchObject({ kind: 'mention', query: '' });
    type('an');
    expect(press('ArrowDown')).toBe(true);
    expect(keydown).toHaveBeenCalledTimes(1);
    expect(press('Escape')).toBe(true);
    expect(changes.at(-1)).toBeNull();
    type('n');
    expect(changes.at(-1)).toBeNull();
    expect(suggestionKey.getState(view.state)?.dismissedAt).toBe(4);
    view.dispatch(view.state.tr.insertText('X', 1));
    expect(suggestionKey.getState(view.state)?.dismissedAt).toBe(5);
    view.dispatch(view.state.tr.setMeta(suggestionKey, { dismissedAt: null }));
    expect(changes.at(-1)).toMatchObject({ kind: 'mention', query: 'ann' });
  });
});

describe('AI range', () => {
  it('marks a pending range, maps it through edits and drops it', () => {
    const view = new EditorView(document.createElement('div'), { state: stateOf('<p>Hello world</p>') });
    view.dispatch(view.state.tr.setMeta(aiKey, { from: 7, to: 12, done: false }));
    expect(view.dom.querySelector('.tx-editor__ai-pending')?.textContent).toBe('world');
    view.dispatch(view.state.tr.insertText('Oh ', 1));
    expect(aiKey.getState(view.state)).toEqual({ from: 10, to: 15, done: false });
    view.dispatch(view.state.tr.setSelection(TextSelection.create(view.state.doc, 2)));
    expect(aiKey.getState(view.state)).toEqual({ from: 10, to: 15, done: false });
    view.dispatch(view.state.tr.setMeta(aiKey, { from: 10, to: 15, done: true }));
    expect(view.dom.querySelector('.tx-editor__ai-result')?.textContent).toBe('world');
    view.dispatch(view.state.tr.setMeta(aiKey, { from: 4, to: 4, done: true }));
    expect(view.dom.querySelector('.tx-editor__ai-result')).toBeNull();
    view.dispatch(view.state.tr.setMeta(aiKey, null));
    view.dispatch(view.state.tr.insertText('!', 1));
    expect(aiKey.getState(view.state)).toBeNull();
    view.destroy();
  });
});
