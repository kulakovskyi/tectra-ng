export interface HtmlElement {
  tag: string;
  attrs: Record<string, string>;
  children: HtmlNode[];
}

export type HtmlNode = HtmlElement | string;

const VOID_TAG = /^(?:area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/;
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);
export const SKIPPED_TAGS = new Set(['script', 'style', 'template', 'title', 'head', 'noscript', 'svg', 'canvas', 'iframe', 'object', 'select', 'button', 'input', 'textarea']);
export const BLOCK_TAG = /^(?:address|article|aside|blockquote|center|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|main|menu|nav|ol|p|pre|section|summary|table|ul)$/;

interface ImpliedEnd {
  closes: RegExp;
  scope: RegExp;
}

const SECTIONS = /^(?:thead|tbody|tfoot|tr|td|th|caption)$/;
const TABLE_SCOPE = /^table$/;
const IMPLIED_ENDS: Record<string, ImpliedEnd> = {
  li: { closes: /^li$/, scope: /^(?:ul|ol|menu)$/ },
  dt: { closes: /^(?:dt|dd)$/, scope: /^dl$/ },
  dd: { closes: /^(?:dt|dd)$/, scope: /^dl$/ },
  tr: { closes: /^(?:tr|td|th|caption)$/, scope: /^(?:table|thead|tbody|tfoot)$/ },
  td: { closes: /^(?:td|th)$/, scope: /^(?:tr|table)$/ },
  th: { closes: /^(?:td|th)$/, scope: /^(?:tr|table)$/ },
  thead: { closes: SECTIONS, scope: TABLE_SCOPE },
  tbody: { closes: SECTIONS, scope: TABLE_SCOPE },
  tfoot: { closes: SECTIONS, scope: TABLE_SCOPE },
};

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ensp: ' ',
  emsp: ' ',
  thinsp: ' ',
  shy: '',
  zwnj: '‌',
  zwj: '‍',
  copy: '©',
  reg: '®',
  trade: '™',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  minus: '−',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  laquo: '«',
  raquo: '»',
  bull: '•',
  middot: '·',
  deg: '°',
  plusmn: '±',
  times: '×',
  divide: '÷',
  euro: '€',
  pound: '£',
  yen: '¥',
  cent: '¢',
  sect: '§',
  para: '¶',
  numero: '№',
  larr: '←',
  rarr: '→',
  uarr: '↑',
  darr: '↓',
  harr: '↔',
  check: '✓',
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[\da-f]+|#\d+|[a-z][a-z\d]*);/gi, (entity, body: string) => {
    if (body[0] === '#') {
      const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : entity;
    }
    return ENTITIES[body.toLowerCase()] ?? entity;
  });
}

function parseAttributes(source: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (const match of source.matchAll(/([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
  }
  return attrs;
}

function tagEnd(html: string, from: number): number {
  let quote = '';
  for (let index = from; index < html.length; index++) {
    const char = html[index];
    if (quote) {
      if (char === quote) quote = '';
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === '>') {
      return index;
    }
  }
  return html.length;
}

/** Reads an HTML string into a tree without a DOM, so it runs on the server too; forgiving like a browser for common markup. */
export function parseHtml(html: string): HtmlElement {
  const root: HtmlElement = { tag: '#root', attrs: {}, children: [] };
  const stack: HtmlElement[] = [root];
  const top = () => stack[stack.length - 1];
  const text = (value: string) => {
    if (value) top().children.push(decodeEntities(value));
  };
  const closeImplied = (tag: string) => {
    const rule = IMPLIED_ENDS[tag];
    if (rule) {
      let close = 0;
      for (let index = stack.length - 1; index > 0 && !rule.scope.test(stack[index].tag); index--) {
        if (rule.closes.test(stack[index].tag)) close = index;
      }
      if (close) stack.length = close;
    }
    if (BLOCK_TAG.test(tag)) {
      for (let index = stack.length - 1; index > 0; index--) {
        const open = stack[index].tag;
        if (open === 'p') {
          stack.length = index;
          break;
        }
        if (BLOCK_TAG.test(open) || open === 'li' || open === 'td' || open === 'th') break;
      }
    }
  };

  let index = 0;
  while (index < html.length) {
    const open = html.indexOf('<', index);
    if (open < 0) {
      text(html.slice(index));
      break;
    }
    text(html.slice(index, open));
    if (html.startsWith('<!--', open)) {
      const end = html.indexOf('-->', open + 4);
      index = end < 0 ? html.length : end + 3;
      continue;
    }
    const name = /^<(\/?)([a-zA-Z][\w:-]*)/.exec(html.slice(open, open + 64));
    if (!name) {
      if (html[open + 1] === '!' || html[open + 1] === '?') {
        index = tagEnd(html, open) + 1;
      } else {
        text('<');
        index = open + 1;
      }
      continue;
    }
    const end = tagEnd(html, open + name[0].length);
    const tag = name[2].toLowerCase();
    index = end + 1;
    if (name[1]) {
      const at = stack.map((element) => element.tag).lastIndexOf(tag);
      if (at > 0) stack.length = at;
      else if (tag === 'br') top().children.push({ tag, attrs: {}, children: [] });
      continue;
    }
    const body = html.slice(open + name[0].length, end);
    closeImplied(tag);
    const element: HtmlElement = { tag, attrs: parseAttributes(body), children: [] };
    top().children.push(element);
    if (RAW_TAGS.has(tag)) {
      const close = html.toLowerCase().indexOf(`</${tag}`, index);
      const stop = close < 0 ? html.length : close;
      element.children.push(html.slice(index, stop));
      index = close < 0 ? html.length : tagEnd(html, close) + 1;
      continue;
    }
    if (!VOID_TAG.test(tag) && !body.trimEnd().endsWith('/')) stack.push(element);
  }
  return root;
}

interface DomNode {
  readonly nodeType: number;
  readonly nodeValue: string | null;
  readonly childNodes: ArrayLike<DomNode>;
  readonly tagName?: string;
  readonly attributes?: ArrayLike<{ readonly name: string; readonly value: string }>;
  readonly body?: DomNode | null;
}

function domChildren(node: DomNode): HtmlNode[] {
  return Array.from(node.childNodes).flatMap((child) => {
    const read = fromDomNode(child);
    return read === null ? [] : [read];
  });
}

function fromDomNode(node: DomNode): HtmlNode | null {
  if (node.nodeType === 3) return node.nodeValue as string;
  if (node.nodeType !== 1) return null;
  const attrs: Record<string, string> = {};
  for (const attr of Array.from(node.attributes as ArrayLike<{ readonly name: string; readonly value: string }>)) attrs[attr.name.toLowerCase()] = attr.value;
  return { tag: (node.tagName as string).toLowerCase(), attrs, children: domChildren(node) };
}

/** Reads a DOM node — an element, a fragment or a document — into the same tree as `parseHtml`. */
export function readDom(node: Node): HtmlElement {
  const source = node as unknown as DomNode;
  if (source.nodeType === 9) return { tag: '#root', attrs: {}, children: source.body ? domChildren(source.body) : [] };
  if (source.nodeType === 11) return { tag: '#root', attrs: {}, children: domChildren(source) };
  const read = fromDomNode(source);
  return { tag: '#root', attrs: {}, children: read === null ? [] : [read] };
}
