import { fromQuillHtml, isQuillHtml, toQuillHtml } from './editor-html';
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
