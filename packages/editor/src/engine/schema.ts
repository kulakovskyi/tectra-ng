import { DOMOutputSpec, Mark, MarkSpec, Node as ProseNode, NodeSpec, Schema } from 'prosemirror-model';

export const INDENT_STEP_EM = 3;
export const MAX_INDENT = 8;
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];
const SAFE_LINK = /^(https?:|mailto:|tel:|sms:|#|\/(?!\/))/i;
const SAFE_IMAGE = /^(https?:|data:image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml);base64,|blob:|\/(?!\/))/i;

export interface TxBlockAttrs {
  align: string | null;
  indent: number;
  dir: string | null;
}

function readBlockAttrs(element: HTMLElement): TxBlockAttrs {
  const align = element.style.textAlign;
  const data = Number(element.getAttribute('data-indent'));
  const margin = element.style.marginLeft;
  const indent = data > 0 ? data : margin.endsWith('em') ? Math.round(parseFloat(margin) / INDENT_STEP_EM) : 0;
  return {
    align: ALIGNMENTS.includes(align) && align !== 'left' ? align : null,
    indent: Math.max(0, Math.min(MAX_INDENT, indent || 0)),
    dir: element.getAttribute('dir') === 'rtl' ? 'rtl' : null,
  };
}

function blockAttrsToDom(attrs: Record<string, unknown>): Record<string, string> {
  const dom: Record<string, string> = {};
  const styles: string[] = [];
  if (attrs['align']) {
    styles.push(`text-align: ${attrs['align']}`);
  }
  const indent = Number(attrs['indent'] ?? 0);
  if (indent > 0) {
    dom['data-indent'] = String(indent);
    styles.push(`margin-left: ${indent * INDENT_STEP_EM}em`);
  }
  if (attrs['dir']) {
    dom['dir'] = String(attrs['dir']);
  }
  if (styles.length) {
    dom['style'] = styles.join('; ');
  }
  return dom;
}

const blockAttrs = { align: { default: null }, indent: { default: 0 }, dir: { default: null } };

export function toVideoEmbed(value: string): string | null {
  const url = value.trim();
  const youtube = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/i);
  if (youtube) {
    return `https://www.youtube.com/embed/${youtube[1]}`;
  }
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }
  return /^https:\/\/\S+$/i.test(url) ? url : null;
}

function styleAttrs(element: HTMLElement): Record<string, string | null> | null {
  const style = element.style;
  const attrs = {
    color: style.color || null,
    background: style.backgroundColor || null,
    fontSize: style.fontSize || null,
    fontFamily: style.fontFamily || null,
  };
  return Object.values(attrs).some(Boolean) ? attrs : null;
}

const nodes: Record<string, NodeSpec> = {
  doc: { content: 'block+' },
  paragraph: {
    content: 'inline*',
    group: 'block',
    attrs: blockAttrs,
    parseDOM: [{ tag: 'p', getAttrs: (dom) => readBlockAttrs(dom as HTMLElement) }],
    toDOM: (node): DOMOutputSpec => ['p', blockAttrsToDom(node.attrs), 0],
  },
  heading: {
    content: 'inline*',
    group: 'block',
    defining: true,
    attrs: { level: { default: 1 }, ...blockAttrs },
    parseDOM: [1, 2, 3, 4, 5, 6].map((level) => ({ tag: `h${level}`, getAttrs: (dom: HTMLElement | string) => ({ level, ...readBlockAttrs(dom as HTMLElement) }) })),
    toDOM: (node): DOMOutputSpec => [`h${node.attrs['level']}`, blockAttrsToDom(node.attrs), 0],
  },
  blockquote: {
    content: 'block+',
    group: 'block',
    defining: true,
    parseDOM: [{ tag: 'blockquote' }],
    toDOM: (): DOMOutputSpec => ['blockquote', 0],
  },
  code_block: {
    content: 'text*',
    marks: '',
    group: 'block',
    code: true,
    defining: true,
    attrs: { language: { default: null } },
    parseDOM: [
      {
        tag: 'pre',
        preserveWhitespace: 'full',
        getAttrs: (dom) => {
          const code = (dom as HTMLElement).querySelector('code');
          const language = Array.from(code?.classList ?? []).find((name) => name.startsWith('language-'));
          return { language: language ? language.slice(9) : null };
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => ['pre', ['code', node.attrs['language'] ? { class: `language-${node.attrs['language']}` } : {}, 0]],
  },
  horizontal_rule: {
    group: 'block',
    parseDOM: [{ tag: 'hr' }],
    toDOM: (): DOMOutputSpec => ['hr'],
  },
  image: {
    group: 'block',
    draggable: true,
    attrs: { src: {}, alt: { default: null }, title: { default: null }, width: { default: null } },
    parseDOM: [
      {
        tag: 'img[src]',
        getAttrs: (dom) => {
          const element = dom as HTMLImageElement;
          const src = element.getAttribute('src') ?? '';
          return SAFE_IMAGE.test(src)
            ? { src, alt: element.getAttribute('alt'), title: element.getAttribute('title'), width: element.getAttribute('width') }
            : false;
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      'img',
      Object.fromEntries(Object.entries({ src: node.attrs['src'], alt: node.attrs['alt'], title: node.attrs['title'], width: node.attrs['width'] }).filter(([, value]) => value)),
    ],
  },
  video: {
    group: 'block',
    atom: true,
    draggable: true,
    attrs: { src: {} },
    parseDOM: [
      {
        tag: 'iframe[src]',
        getAttrs: (dom) => {
          const src = toVideoEmbed((dom as HTMLElement).getAttribute('src') ?? '');
          return src ? { src } : false;
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      'iframe',
      { 'data-type': 'video', src: node.attrs['src'], frameborder: '0', allowfullscreen: 'true', allow: 'encrypted-media; picture-in-picture; fullscreen' },
    ],
  },
  bullet_list: {
    content: 'list_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul' }],
    toDOM: (): DOMOutputSpec => ['ul', 0],
  },
  ordered_list: {
    content: 'list_item+',
    group: 'block',
    attrs: { start: { default: 1 } },
    parseDOM: [{ tag: 'ol', getAttrs: (dom) => ({ start: Number((dom as HTMLElement).getAttribute('start') ?? 1) || 1 }) }],
    toDOM: (node): DOMOutputSpec => ['ol', node.attrs['start'] === 1 ? {} : { start: node.attrs['start'] }, 0],
  },
  list_item: {
    content: 'paragraph block*',
    defining: true,
    parseDOM: [{ tag: 'li' }],
    toDOM: (): DOMOutputSpec => ['li', 0],
  },
  task_list: {
    content: 'task_item+',
    group: 'block',
    parseDOM: [{ tag: 'ul[data-type="taskList"]', priority: 60 }],
    toDOM: (): DOMOutputSpec => ['ul', { 'data-type': 'taskList' }, 0],
  },
  task_item: {
    content: 'paragraph block*',
    defining: true,
    attrs: { checked: { default: false } },
    parseDOM: [
      {
        tag: 'li[data-type="taskItem"]',
        priority: 60,
        getAttrs: (dom) => ({ checked: (dom as HTMLElement).getAttribute('data-checked') === 'true' }),
        contentElement: (dom) => (dom as HTMLElement).querySelector(':scope > div') ?? (dom as HTMLElement),
      },
    ],
    toDOM: (node): DOMOutputSpec => [
      'li',
      { 'data-type': 'taskItem', 'data-checked': String(node.attrs['checked']) },
      ['label', ['input', node.attrs['checked'] ? { type: 'checkbox', checked: 'checked' } : { type: 'checkbox' }], ['span']],
      ['div', 0],
    ],
  },
  hard_break: {
    inline: true,
    group: 'inline',
    selectable: false,
    parseDOM: [{ tag: 'br' }],
    toDOM: (): DOMOutputSpec => ['br'],
  },
  mention: {
    inline: true,
    group: 'inline',
    atom: true,
    selectable: false,
    attrs: { id: {}, label: {} },
    parseDOM: [
      {
        tag: 'span[data-type="mention"]',
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          const id = element.getAttribute('data-id');
          return id ? { id, label: element.getAttribute('data-label') ?? element.textContent?.replace(/^@/, '') ?? id } : false;
        },
      },
    ],
    toDOM: (node): DOMOutputSpec => ['span', { 'data-type': 'mention', 'data-id': node.attrs['id'], 'data-label': node.attrs['label'] }, `@${node.attrs['label']}`],
    leafText: (node: ProseNode) => `@${node.attrs['label']}`,
  },
  text: { group: 'inline' },
};

const marks: Record<string, MarkSpec> = {
  link: {
    attrs: { href: {}, target: { default: '_blank' }, rel: { default: 'noopener noreferrer nofollow' } },
    inclusive: false,
    parseDOM: [
      {
        tag: 'a[href]',
        getAttrs: (dom) => {
          const element = dom as HTMLAnchorElement;
          const href = element.getAttribute('href') ?? '';
          return SAFE_LINK.test(href) ? { href, target: element.getAttribute('target') === '_blank' ? '_blank' : null, rel: element.getAttribute('rel') } : false;
        },
      },
    ],
    toDOM: (mark: Mark): DOMOutputSpec => [
      'a',
      Object.fromEntries(Object.entries({ href: mark.attrs['href'], target: mark.attrs['target'], rel: mark.attrs['target'] ? mark.attrs['rel'] || 'noopener noreferrer nofollow' : null }).filter(([, value]) => value)),
      0,
    ],
  },
  bold: {
    parseDOM: [
      { tag: 'strong' },
      { tag: 'b', getAttrs: (dom) => ((dom as HTMLElement).style.fontWeight !== 'normal' ? null : false) },
      { style: 'font-weight', getAttrs: (value) => (/^(bold(er)?|[6-9]\d{2})$/.test(value as string) ? null : false) },
    ],
    toDOM: (): DOMOutputSpec => ['strong', 0],
  },
  italic: {
    parseDOM: [{ tag: 'em' }, { tag: 'i' }, { style: 'font-style=italic' }],
    toDOM: (): DOMOutputSpec => ['em', 0],
  },
  underline: {
    parseDOM: [{ tag: 'u' }, { style: 'text-decoration', getAttrs: (value) => ((value as string).includes('underline') ? null : false) }],
    toDOM: (): DOMOutputSpec => ['u', 0],
  },
  strike: {
    parseDOM: [{ tag: 's' }, { tag: 'del' }, { tag: 'strike' }, { style: 'text-decoration', getAttrs: (value) => ((value as string).includes('line-through') ? null : false) }],
    toDOM: (): DOMOutputSpec => ['s', 0],
  },
  code: {
    excludes: '_',
    parseDOM: [{ tag: 'code' }],
    toDOM: (): DOMOutputSpec => ['code', 0],
  },
  subscript: {
    excludes: 'superscript',
    parseDOM: [{ tag: 'sub' }],
    toDOM: (): DOMOutputSpec => ['sub', 0],
  },
  superscript: {
    excludes: 'subscript',
    parseDOM: [{ tag: 'sup' }],
    toDOM: (): DOMOutputSpec => ['sup', 0],
  },
  text_style: {
    attrs: { color: { default: null }, background: { default: null }, fontSize: { default: null }, fontFamily: { default: null } },
    parseDOM: [
      { tag: 'span[style]', getAttrs: (dom) => styleAttrs(dom as HTMLElement) ?? false },
      { tag: 'mark', getAttrs: (dom) => ({ ...(styleAttrs(dom as HTMLElement) ?? {}), background: (dom as HTMLElement).style.backgroundColor || 'rgba(234, 179, 8, 0.28)' }) },
    ],
    toDOM: (mark: Mark): DOMOutputSpec => {
      const styles = [
        mark.attrs['color'] && `color: ${mark.attrs['color']}`,
        mark.attrs['background'] && `background-color: ${mark.attrs['background']}`,
        mark.attrs['fontSize'] && `font-size: ${mark.attrs['fontSize']}`,
        mark.attrs['fontFamily'] && `font-family: ${mark.attrs['fontFamily']}`,
      ].filter(Boolean);
      return ['span', { style: styles.join('; ') }, 0];
    },
  },
};

export const txEditorSchema = new Schema({ nodes, marks });

export type TxEditorSchema = typeof txEditorSchema;
