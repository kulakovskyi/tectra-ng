import { formatEditorHtml, fromQuillHtml, isQuillHtml, toEditorHtml, toQuillHtml } from './editor-html';
import { sanitizeEditorHtml } from './editor-sanitizer';

const quill = [
  '<h2 class="ql-align-center">Plan</h2>',
  '<p class="ql-indent-1">Indented <span style="color: rgb(230, 0, 0);">red</span> <span class="ql-size-large">big</span></p>',
  '<ol>',
  '<li data-list="bullet"><span class="ql-ui" contenteditable="false"></span>One</li>',
  '<li data-list="bullet" class="ql-indent-1"><span class="ql-ui" contenteditable="false"></span>Nested</li>',
  '<li data-list="ordered"><span class="ql-ui" contenteditable="false"></span>First</li>',
  '<li data-list="checked"><span class="ql-ui" contenteditable="false"></span>Done</li>',
  '<li data-list="unchecked"><span class="ql-ui" contenteditable="false"></span>Todo</li>',
  '</ol>',
  '<div class="ql-code-block-container" spellcheck="false"><div class="ql-code-block" data-language="plain">const a = 1;</div><div class="ql-code-block" data-language="plain">a++;</div></div>',
  '<iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/abcdefg"></iframe>',
  '<p><br></p>',
].join('');

describe('Quill HTML', () => {
  it('detects Quill markup', () => {
    expect(isQuillHtml(quill)).toBe(true);
    expect(isQuillHtml('<p>Plain</p><ul><li><p>One</p></li></ul>')).toBe(false);
  });

  it('turns Quill markup into clean HTML', () => {
    const body = document.createElement('div');
    body.innerHTML = fromQuillHtml(quill);
    expect(body.querySelector('h2')?.getAttribute('style')).toBe('text-align: center;');
    const paragraph = body.querySelector('p') as HTMLElement;
    expect(paragraph.getAttribute('data-indent')).toBe('1');
    expect(paragraph.style.marginLeft).toBe('3em');
    expect((paragraph.querySelector('span:last-child') as HTMLElement).style.fontSize).toBe('1.5em');
    const bullet = body.querySelector(':scope > ul:not([data-type])') as HTMLElement;
    expect(bullet.querySelector(':scope > li > p')?.textContent).toBe('One');
    expect(bullet.querySelector(':scope > li > ul > li > p')?.textContent).toBe('Nested');
    expect(body.querySelector(':scope > ol > li > p')?.textContent).toBe('First');
    const tasks = Array.from(body.querySelectorAll('ul[data-type="taskList"] > li'));
    expect(tasks.map((task) => `${task.getAttribute('data-checked')}:${task.textContent}`)).toEqual(['true:Done', 'false:Todo']);
    expect(body.querySelector('pre > code')?.textContent).toBe('const a = 1;\na++;');
    expect(body.querySelector('iframe')?.getAttribute('data-type')).toBe('video');
    expect(body.innerHTML).not.toContain('ql-');
  });

  it('leaves clean HTML untouched', () => {
    const html = '<p style="text-align: right;">Hi</p><ul><li><p>One</p></li></ul>';
    expect(fromQuillHtml(html)).toBe(html);
  });

  it('writes clean HTML back as Quill markup', () => {
    const clean = [
      '<h1 style="text-align: center;">Title</h1>',
      '<p data-indent="2" style="margin-left: 6em;">Deep</p>',
      '<ul><li><p>One</p><ul><li><p>Nested</p></li></ul></li></ul>',
      '<ol><li><p>First</p></li></ol>',
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox"><span></span></label><div><p>Done</p></div></li></ul>',
      '<pre><code class="language-ts">let a;\nlet b;</code></pre>',
      '<p></p>',
    ].join('');
    const body = document.createElement('div');
    body.innerHTML = toQuillHtml(clean);
    expect(body.querySelector('h1')?.className).toBe('ql-align-center');
    expect(body.querySelector('p')?.className).toBe('ql-indent-2');
    expect(body.querySelector('p')?.getAttribute('style')).toBeNull();
    const items = Array.from(body.querySelectorAll('ol > li'));
    expect(items.map((item) => `${item.getAttribute('data-list')}|${item.className}|${item.textContent}`)).toEqual([
      'bullet||One',
      'bullet|ql-indent-1|Nested',
      'ordered||First',
      'checked||Done',
    ]);
    expect(body.querySelectorAll(':scope > ol')).toHaveLength(1);
    const lines = Array.from(body.querySelectorAll('.ql-code-block-container > .ql-code-block'));
    expect(lines.map((line) => `${line.getAttribute('data-language')}:${line.textContent}`)).toEqual(['ts:let a;', 'ts:let b;']);
    expect(body.innerHTML.endsWith('<p><br></p>')).toBe(true);
  });

  it('survives a round trip', () => {
    const body = document.createElement('div');
    body.innerHTML = fromQuillHtml(toQuillHtml('<ul><li><p>A</p><ul><li><p>B</p></li></ul></li><li><p>C</p></li></ul>'));
    expect(body.querySelector(':scope > ul > li > ul > li')?.textContent).toBe('B');
    expect(body.querySelectorAll(':scope > ul > li')).toHaveLength(2);
  });
});

describe('sanitizeEditorHtml', () => {
  it('keeps formatting and drops scripts, handlers and unsafe urls', () => {
    const dirty = [
      '<p style="color: red; position: fixed; text-align: center" onclick="alert(1)">Hi<script>alert(1)</script></p>',
      '<a href="javascript:alert(1)">bad</a><a href="https://example.com" target="_blank">good</a>',
      '<img src="x" onerror="alert(1)"><img src="data:image/png;base64,AAA" alt="pic">',
      '<iframe src="http://example.com"></iframe><iframe src="https://www.youtube.com/embed/abc"></iframe>',
      '<style>p{}</style><form><input type="text"></form><span class="ql-size-large evil">Big</span>',
      '<p style="background-color: url(javascript:alert(1))">x</p>',
    ].join('');
    const body = document.createElement('div');
    body.innerHTML = sanitizeEditorHtml(dirty);
    const paragraph = body.querySelector('p') as HTMLElement;
    expect(paragraph.getAttribute('style')).toBe('color: red; text-align: center');
    expect(paragraph.hasAttribute('onclick')).toBe(false);
    expect(body.querySelector('script, style, form')).toBeNull();
    const links = Array.from(body.querySelectorAll('a'));
    expect(links[0].hasAttribute('href')).toBe(false);
    expect(links[1].getAttribute('rel')).toBe('noopener noreferrer nofollow');
    const images = Array.from(body.querySelectorAll('img'));
    expect(images[0].hasAttribute('onerror')).toBe(false);
    expect(images[0].hasAttribute('src')).toBe(false);
    expect(images[1].getAttribute('src')).toBe('data:image/png;base64,AAA');
    const frames = Array.from(body.querySelectorAll('iframe'));
    expect(frames).toHaveLength(1);
    expect(frames[0].getAttribute('sandbox')).toContain('allow-scripts');
    expect(body.querySelector('span')?.className).toBe('ql-size-large');
    expect(body.querySelectorAll('p')[1].hasAttribute('style')).toBe(false);
  });
});

describe('more Quill markup', () => {
  const read = (html: string) => {
    const body = document.createElement('div');
    body.innerHTML = html;
    return body;
  };

  it('reads old lists without data-list, aligned items, fonts, direction and code languages', () => {
    const body = read(
      fromQuillHtml(
        [
          '<ul><li>One</li><li class="ql-indent-1 ql-align-right">Two</li></ul>',
          '<ol><li class="ql-indent-1">Deep</li></ol>',
          '<p class="ql-font-serif ql-direction-rtl ql-size-unknown ql-align-sideways">Serif<span class="ql-font-fancy">F</span></p>',
          '<div class="ql-code-block-container"><div class="ql-code-block" data-language="js">a</div></div>',
          '<div class="ql-code-block-container"><div class="ql-code-block">b</div></div>',
        ].join(''),
      ),
    );
    expect(body.querySelector(':scope > ul > li > p')?.textContent).toBe('One');
    const nested = body.querySelector(':scope > ul > li > ul > li > p') as HTMLElement;
    expect(nested.textContent).toBe('Two');
    expect(nested.style.textAlign).toBe('right');
    expect(body.querySelector(':scope > ol > li > p')?.textContent).toBe('Deep');
    const paragraph = body.querySelector(':scope > p') as HTMLElement;
    expect(paragraph.style.fontFamily).toBe('serif');
    expect(paragraph.getAttribute('dir')).toBe('rtl');
    expect(paragraph.style.fontSize).toBe('');
    expect(paragraph.hasAttribute('class')).toBe(false);
    expect(paragraph.querySelector('span')?.outerHTML).toBe('<span>F</span>');
    expect(Array.from(body.querySelectorAll('pre > code')).map((code) => `${code.className}:${code.textContent}`)).toEqual(['language-js:a', ':b']);
  });

  it('starts a new list when the kind changes at the same level', () => {
    const body = read(fromQuillHtml('<ol><li data-list="bullet">A</li><li data-list="ordered">B</li><li data-list="checked">C</li><li data-list="unchecked">D</li></ol>'));
    expect(Array.from(body.children).map((child) => `${child.tagName}:${child.textContent}`)).toEqual(['UL:A', 'OL:B', 'UL:CD']);
  });

  it('writes lists, code, sizes, fonts, direction and videos as Quill markup', () => {
    const clean = [
      '<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p style="text-align: center">Task</p><p>More</p></li></ul>',
      '<ul><li><p style="text-align: left">Left</p></li></ul>',
      '<pre>plain\n\nend</pre>',
      '<p dir="rtl" style="font-size: 0.75em; font-family: monospace; margin-left: 6em">Small</p>',
      '<span style="font-size: 3em">Odd</span>',
      '<iframe data-type="video" src="https://player.vimeo.com/video/1"></iframe>',
    ].join('');
    const body = read(toQuillHtml(clean));
    const items = Array.from(body.querySelectorAll('ol > li'));
    expect(items.map((item) => `${item.getAttribute('data-list')}|${item.className}|${item.innerHTML}`)).toEqual([
      'unchecked|ql-align-center|Task<br>More',
      'bullet||Left',
    ]);
    expect(Array.from(body.querySelectorAll('.ql-code-block')).map((line) => `${line.getAttribute('data-language')}:${line.innerHTML}`)).toEqual([
      'plain:plain',
      'plain:<br>',
      'plain:end',
    ]);
    const paragraph = body.querySelector('p') as HTMLElement;
    expect(paragraph.className).toBe('ql-indent-2 ql-size-small ql-font-monospace ql-direction-rtl');
    expect(paragraph.hasAttribute('dir')).toBe(false);
    expect(paragraph.hasAttribute('style')).toBe(false);
    expect(body.querySelector('span')?.getAttribute('style')).toBe('font-size: 3em');
    const frame = body.querySelector('iframe') as HTMLIFrameElement;
    expect(frame.className).toBe('ql-video');
    expect(frame.hasAttribute('data-type')).toBe(false);
    expect(frame.getAttribute('frameborder')).toBe('0');
    expect(frame.getAttribute('allowfullscreen')).toBe('true');
  });

  it('reads the item blocks of task lists written without a wrapper', () => {
    const body = read(toQuillHtml('<ul data-type="taskList"><li data-type="taskItem" data-checked="true"><label><input type="checkbox"></label><p>Bare</p></li></ul>'));
    expect(body.querySelector('li')?.outerHTML).toBe('<li data-list="checked">Bare</li>');
  });

  it('keeps other classes and skips elements without inline styles', () => {
    expect(fromQuillHtml('<p class="ql-align-center tx-note">x</p>')).toBe('<p class="tx-note" style="text-align: center;">x</p>');
    expect(fromQuillHtml('<math class="ql-align-center ql-indent-2"></math>')).toBe('<math></math>');
    expect(toQuillHtml('<math data-indent="x" dir="rtl"></math><p style="text-align: left">L</p>')).toBe('<math class="ql-direction-rtl"></math><p>L</p>');
  });

  it('passes empty values through and picks the format', () => {
    expect(fromQuillHtml('')).toBe('');
    expect(fromQuillHtml(null)).toBe('');
    expect(toQuillHtml(undefined)).toBe('');
    expect(toEditorHtml('<p class="ql-align-center">x</p>')).toBe('<p style="text-align: center;">x</p>');
    expect(formatEditorHtml('<p>x</p>', 'html')).toBe('<p>x</p>');
    expect(formatEditorHtml('<p style="text-align: right">x</p>', 'quill')).toBe('<p class="ql-align-right">x</p>');
  });
});

describe('more sanitizing', () => {
  it('drops comments, unsafe classes, targets and input types and disables checkboxes', () => {
    const html = sanitizeEditorHtml(
      '<!-- note --><p class="evil">a</p><a href="https://a.com" target="_top">b</a><input type="checkbox" checked><input type="text"><span>c</span>',
    );
    expect(html).toBe('<p>a</p><a href="https://a.com">b</a><input type="checkbox" checked="" disabled=""><input disabled=""><span>c</span>');
    expect(sanitizeEditorHtml('')).toBe('');
    expect(sanitizeEditorHtml('<iframe></iframe><p>x</p>')).toBe('<p>x</p>');
  });
});

describe('without DOMParser (server rendering)', () => {
  const Parser = globalThis.DOMParser;

  beforeEach(() => {
    Reflect.deleteProperty(globalThis, 'DOMParser');
  });

  afterEach(() => {
    globalThis.DOMParser = Parser;
  });

  it('sanitizes and converts through the given document', () => {
    expect(sanitizeEditorHtml('<p onclick="x()">Hi<script>x()</script></p>', document)).toBe('<p>Hi</p>');
    expect(fromQuillHtml('<ol><li data-list="bullet">A</li></ol>', document)).toBe('<ul><li><p>A</p></li></ul>');
  });

  it('renders nothing unsafe without a document', () => {
    expect(sanitizeEditorHtml('<p>Hi</p>')).toBe('');
    expect(fromQuillHtml('<p class="ql-align-center">Hi</p>')).toBe('<p class="ql-align-center">Hi</p>');
    expect(toQuillHtml('<p>Hi</p>')).toBe('<p>Hi</p>');
  });

  it('works on a DOM without append, replaceWith and replaceChildren', () => {
    const methods = ['append', 'replaceWith', 'replaceChildren'] as const;
    const saved = methods.map((name) => [name, Object.getOwnPropertyDescriptor(Element.prototype, name)] as const);
    methods.forEach((name) => Reflect.deleteProperty(Element.prototype, name));
    try {
      const quill = '<ol><li data-list="bullet">A</li><li data-list="bullet" class="ql-indent-1">B</li></ol><pre class="ql-syntax">x</pre>';
      expect(fromQuillHtml(quill, document)).toBe('<ul><li><p>A</p><ul><li><p>B</p></li></ul></li></ul><pre><code>x</code></pre>');
      expect(sanitizeEditorHtml('<p>a<custom>b</custom></p>', document)).toBe('<p>ab</p>');
    } finally {
      saved.forEach(([name, descriptor]) => descriptor && Object.defineProperty(Element.prototype, name, descriptor));
    }
  });
});
