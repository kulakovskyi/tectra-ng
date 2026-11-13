import { TxEditorFormat } from './editor-content.types';
import { appendNodes, parseHtmlBody, replaceNode } from './parse-html';

const QUILL_SIZES: Record<string, string> = { small: '0.75em', large: '1.5em', huge: '2.5em' };
const QUILL_FONTS: Record<string, string> = { serif: 'serif', monospace: 'monospace' };
const INDENT_STEP_EM = 3;
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const QUILL_MARKERS = /data-list=|class="[^"]*\bql-|ql-code-block|ql-video/;

type TxListKind = 'bullet' | 'ordered' | 'checked' | 'unchecked';

function classValue(element: Element, prefix: string): string | null {
  const match = Array.from(element.classList).find((name) => name.startsWith(prefix));
  if (!match) {
    return null;
  }
  element.classList.remove(match);
  return match.slice(prefix.length);
}

function cleanClassAttribute(element: Element): void {
  if (element.getAttribute('class') === '') {
    element.removeAttribute('class');
  }
}

function styleOf(element: Element): CSSStyleDeclaration | null {
  return (element as HTMLElement).style ?? null;
}

function indentLevel(element: Element): number {
  const value = Number(element.getAttribute('data-indent') ?? NaN);
  if (!Number.isNaN(value)) {
    return value;
  }
  const margin = styleOf(element)?.marginLeft ?? '';
  return margin.endsWith('em') ? Math.round(parseFloat(margin) / INDENT_STEP_EM) : 0;
}

function quillListKind(item: Element, list: Element): TxListKind {
  const data = item.getAttribute('data-list');
  if (data === 'bullet' || data === 'ordered' || data === 'checked' || data === 'unchecked') {
    return data;
  }
  return list.tagName === 'UL' ? 'bullet' : 'ordered';
}

function createList(document: Document, kind: TxListKind): HTMLElement {
  const list = document.createElement(kind === 'ordered' ? 'ol' : 'ul');
  if (kind === 'checked' || kind === 'unchecked') {
    list.setAttribute('data-type', 'taskList');
  }
  return list;
}

function sameListKind(a: TxListKind, b: TxListKind): boolean {
  const task = (kind: TxListKind) => kind === 'checked' || kind === 'unchecked';
  return a === b || (task(a) && task(b));
}

function convertQuillList(list: Element): void {
  const document = list.ownerDocument;
  const items = Array.from(list.children).filter((child) => child.tagName === 'LI');
  const fragment = document.createDocumentFragment();
  const stack: { level: number; kind: TxListKind; element: HTMLElement }[] = [];
  for (const item of items) {
    const kind = quillListKind(item, list);
    const level = Number(classValue(item, 'ql-indent-') ?? 0);
    while (stack.length && stack[stack.length - 1].level > level) {
      stack.pop();
    }
    const top = stack[stack.length - 1];
    if (top && top.level === level && !sameListKind(top.kind, kind)) {
      stack.pop();
    }
    if (!stack.length || stack[stack.length - 1].level < level) {
      const element = createList(document, kind);
      const parent = stack[stack.length - 1];
      if (parent) {
        const lastItem = parent.element.lastElementChild ?? parent.element.appendChild(document.createElement('li'));
        lastItem.appendChild(element);
      } else {
        fragment.appendChild(element);
      }
      stack.push({ level, kind, element });
    }
    const current = stack[stack.length - 1];
    const next = document.createElement('li');
    const paragraph = document.createElement('p');
    const align = classValue(item, 'ql-align-');
    if (align && ALIGNMENTS.includes(align)) {
      paragraph.style.textAlign = align;
    }
    appendNodes(paragraph, item.childNodes);
    if (kind === 'checked' || kind === 'unchecked') {
      next.setAttribute('data-type', 'taskItem');
      next.setAttribute('data-checked', String(kind === 'checked'));
    }
    next.appendChild(paragraph);
    current.element.appendChild(next);
  }
  replaceNode(list, fragment);
}

function convertQuillCode(container: Element): void {
  const document = container.ownerDocument;
  const lines = Array.from(container.querySelectorAll('.ql-code-block'));
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  const language = lines[0]?.getAttribute('data-language');
  if (language && language !== 'plain') {
    code.className = `language-${language}`;
  }
  code.textContent = lines.map((line) => line.textContent ?? '').join('\n');
  pre.appendChild(code);
  replaceNode(container, pre);
}

/** Tells whether the HTML carries Quill 2 markup. */
export function isQuillHtml(html: string | null | undefined): boolean {
  return !!html && QUILL_MARKERS.test(html);
}

/** Converts Quill 2 markup to the clean HTML of the editor; other HTML passes through. */
export function fromQuillHtml(html: string | null | undefined, document?: Document | null): string {
  if (!html) {
    return '';
  }
  if (!isQuillHtml(html)) {
    return html;
  }
  const body = parseHtmlBody(html, document);
  if (!body) {
    return html;
  }
  body.querySelectorAll('.ql-cursor, .ql-ui').forEach((node) => node.remove());
  body.querySelectorAll('.ql-code-block-container').forEach(convertQuillCode);
  body.querySelectorAll('pre.ql-syntax').forEach((pre) => {
    const code = body.ownerDocument.createElement('code');
    code.textContent = pre.textContent ?? '';
    pre.textContent = '';
    pre.appendChild(code);
    pre.classList.remove('ql-syntax');
    cleanClassAttribute(pre);
  });
  Array.from(body.querySelectorAll('ol, ul'))
    .filter((list) => Array.from(list.children).some((item) => item.hasAttribute('data-list') || /\bql-indent-/.test(item.className)))
    .filter((list) => !list.parentElement?.closest('ol, ul'))
    .forEach(convertQuillList);
  body.querySelectorAll('[class*="ql-"]').forEach((element) => {
    const style = styleOf(element);
    const align = classValue(element, 'ql-align-');
    if (align && ALIGNMENTS.includes(align) && style) {
      style.textAlign = align;
    }
    const indent = Number(classValue(element, 'ql-indent-') ?? 0);
    if (indent > 0 && style) {
      element.setAttribute('data-indent', String(indent));
      style.marginLeft = `${indent * INDENT_STEP_EM}em`;
    }
    const size = classValue(element, 'ql-size-');
    if (size && QUILL_SIZES[size] && style) {
      style.fontSize = QUILL_SIZES[size];
    }
    const font = classValue(element, 'ql-font-');
    if (font && QUILL_FONTS[font] && style) {
      style.fontFamily = QUILL_FONTS[font];
    }
    if (classValue(element, 'ql-direction-') === 'rtl') {
      element.setAttribute('dir', 'rtl');
    }
    if (element.tagName === 'IFRAME' && element.classList.contains('ql-video')) {
      element.classList.remove('ql-video');
      element.setAttribute('data-type', 'video');
    }
    cleanClassAttribute(element);
  });
  return body.innerHTML;
}

function flattenList(list: Element, level: number, out: HTMLElement): void {
  const document = list.ownerDocument;
  const task = list.getAttribute('data-type') === 'taskList';
  for (const item of Array.from(list.children).filter((child) => child.tagName === 'LI')) {
    const kind: TxListKind = task ? (item.getAttribute('data-checked') === 'true' ? 'checked' : 'unchecked') : list.tagName === 'OL' ? 'ordered' : 'bullet';
    const next = document.createElement('li');
    next.setAttribute('data-list', kind);
    if (level > 0) {
      next.classList.add(`ql-indent-${level}`);
    }
    const nested: Element[] = [];
    const blocks = task ? Array.from(item.querySelector(':scope > div')?.children ?? item.children) : Array.from(item.children);
    const inline: Node[] = [];
    for (const child of blocks) {
      if (child.tagName === 'UL' || child.tagName === 'OL') {
        nested.push(child);
      } else if (child.tagName === 'LABEL') {
        continue;
      } else {
        const align = styleOf(child)?.textAlign;
        if (align && ALIGNMENTS.includes(align) && align !== 'left') {
          next.classList.add(`ql-align-${align}`);
        }
        if (inline.length) {
          inline.push(document.createElement('br'));
        }
        inline.push(...Array.from(child.childNodes));
      }
    }
    appendNodes(next, inline);
    out.appendChild(next);
    nested.forEach((child) => flattenList(child, level + 1, out));
  }
}

/** Converts the clean HTML of the editor to Quill 2 markup. */
export function toQuillHtml(html: string | null | undefined, document?: Document | null): string {
  if (!html) {
    return '';
  }
  const body = parseHtmlBody(html, document);
  if (!body) {
    return html;
  }
  const owner = body.ownerDocument;
  const topLists = Array.from(body.querySelectorAll('ol, ul')).filter((list) => !list.parentElement?.closest('ol, ul'));
  let previous: HTMLElement | null = null;
  for (const list of topLists) {
    const target: HTMLElement = previous && previous.nextSibling === list ? previous : owner.createElement('ol');
    flattenList(list, 0, target);
    if (target === previous) {
      list.remove();
    } else {
      replaceNode(list, target);
    }
    previous = target;
  }
  body.querySelectorAll('pre').forEach((pre) => {
    const code = pre.querySelector('code');
    const language = Array.from(code?.classList ?? []).find((name) => name.startsWith('language-'))?.slice(9) ?? 'plain';
    const container = owner.createElement('div');
    container.className = 'ql-code-block-container';
    container.setAttribute('spellcheck', 'false');
    for (const line of (code?.textContent ?? pre.textContent ?? '').split('\n')) {
      const block = owner.createElement('div');
      block.className = 'ql-code-block';
      block.setAttribute('data-language', language);
      block.textContent = line;
      if (!line) {
        block.appendChild(owner.createElement('br'));
      }
      container.appendChild(block);
    }
    replaceNode(pre, container);
  });
  body.querySelectorAll('[style], [data-indent], [dir], iframe[data-type="video"]').forEach((element) => {
    const style = styleOf(element);
    if (style?.textAlign && ALIGNMENTS.includes(style.textAlign)) {
      if (style.textAlign !== 'left') {
        element.classList.add(`ql-align-${style.textAlign}`);
      }
      style.removeProperty('text-align');
    }
    const indent = indentLevel(element);
    if (indent > 0) {
      element.classList.add(`ql-indent-${indent}`);
    }
    element.removeAttribute('data-indent');
    style?.removeProperty('margin-left');
    const size = Object.entries(QUILL_SIZES).find(([, value]) => value === style?.fontSize)?.[0];
    if (size) {
      element.classList.add(`ql-size-${size}`);
      style?.removeProperty('font-size');
    }
    const font = Object.entries(QUILL_FONTS).find(([, value]) => value === style?.fontFamily)?.[0];
    if (font) {
      element.classList.add(`ql-font-${font}`);
      style?.removeProperty('font-family');
    }
    if (element.getAttribute('dir') === 'rtl') {
      element.classList.add('ql-direction-rtl');
      element.removeAttribute('dir');
    }
    if (element.tagName === 'IFRAME') {
      element.removeAttribute('data-type');
      element.classList.add('ql-video');
      element.setAttribute('frameborder', '0');
      element.setAttribute('allowfullscreen', 'true');
    }
    if (element.getAttribute('style') === '') {
      element.removeAttribute('style');
    }
  });
  body.querySelectorAll('p:empty, h1:empty, h2:empty, h3:empty, h4:empty, h5:empty, h6:empty').forEach((block) => block.appendChild(owner.createElement('br')));
  return body.innerHTML;
}

/** Brings saved text, from the editor or from Quill, to the clean HTML the editor reads. */
export function toEditorHtml(html: string | null | undefined, document?: Document | null): string {
  return fromQuillHtml(html, document);
}

/** Writes the editor HTML in the chosen format: unchanged for `html`, converted for `quill`. */
export function formatEditorHtml(html: string, format: TxEditorFormat, document?: Document | null): string {
  return format === 'quill' ? toQuillHtml(html, document) : html;
}
