const ALLOWED_TAGS = new Set([
  'p', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'del', 'code', 'pre',
  'blockquote', 'ul', 'ol', 'li', 'a', 'img', 'span', 'sub', 'sup', 'hr', 'mark', 'div', 'label', 'input',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'colgroup', 'col', 'iframe',
]);

const DROP_WITH_CONTENT = new Set(['script', 'style', 'template', 'noscript', 'object', 'embed', 'svg', 'math', 'textarea', 'select', 'button', 'form']);

const ALLOWED_ATTRIBUTES = new Set([
  'class', 'style', 'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height', 'colspan', 'rowspan', 'start', 'dir',
  'data-list', 'data-type', 'data-checked', 'data-indent', 'data-language', 'data-id', 'data-label', 'data-mention-suggestion-char',
  'colwidth', 'data-colwidth', 'data-tone', 'type', 'checked', 'disabled', 'frameborder', 'allowfullscreen', 'spellcheck',
]);

const ALLOWED_STYLES = new Set(['color', 'background-color', 'text-align', 'font-size', 'font-family', 'margin-left', 'padding-left', 'width', 'min-width']);

const SAFE_STYLE_VALUE = /^[#(),.%\w\s'"-]+$/;
const SAFE_CLASS = /^(ql-[\w-]+|tx-[\w-]+|language-[\w-]+)$/;
const SAFE_LINK = /^(https?:|mailto:|tel:|sms:|#|\/(?!\/))/i;
const SAFE_IMAGE = /^(https?:|data:image\/(png|jpe?g|gif|webp|avif|bmp|svg\+xml);base64,|blob:|\/(?!\/))/i;
const SAFE_FRAME = /^https:\/\//i;

function cleanStyle(value: string): string {
  return value
    .split(';')
    .map((declaration) => declaration.split(':'))
    .filter(([property, ...rest]) => property && rest.length)
    .map(([property, ...rest]) => [property.trim().toLowerCase(), rest.join(':').trim()])
    .filter(([property, propertyValue]) => ALLOWED_STYLES.has(property) && SAFE_STYLE_VALUE.test(propertyValue) && !/url\s*\(|expression\s*\(/i.test(propertyValue))
    .map(([property, propertyValue]) => `${property}: ${propertyValue}`)
    .join('; ');
}

function cleanAttribute(element: Element, name: string, value: string): string | null {
  const tag = element.tagName.toLowerCase();
  switch (name) {
    case 'style': {
      const style = cleanStyle(value);
      return style || null;
    }
    case 'class': {
      const classes = value.split(/\s+/).filter((item) => SAFE_CLASS.test(item));
      return classes.length ? classes.join(' ') : null;
    }
    case 'href':
      return tag === 'a' && SAFE_LINK.test(value.trim()) ? value.trim() : null;
    case 'src':
      if (tag === 'img') {
        return SAFE_IMAGE.test(value.trim()) ? value.trim() : null;
      }
      return tag === 'iframe' && SAFE_FRAME.test(value.trim()) ? value.trim() : null;
    case 'target':
      return value === '_blank' ? value : null;
    case 'type':
      return tag === 'input' && value === 'checkbox' ? value : null;
    default:
      return value;
  }
}

function cleanNode(node: Node): void {
  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === 3) {
      continue;
    }
    if (child.nodeType !== 1) {
      child.remove();
      continue;
    }
    const element = child as Element;
    const tag = element.tagName.toLowerCase();
    if (DROP_WITH_CONTENT.has(tag)) {
      element.remove();
      continue;
    }
    if (!ALLOWED_TAGS.has(tag)) {
      cleanNode(element);
      element.replaceWith(...Array.from(element.childNodes));
      continue;
    }
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase();
      const cleaned = ALLOWED_ATTRIBUTES.has(name) ? cleanAttribute(element, name, attribute.value) : null;
      if (cleaned === null) {
        element.removeAttribute(attribute.name);
      } else if (cleaned !== attribute.value) {
        element.setAttribute(attribute.name, cleaned);
      }
    }
    if (tag === 'a' && element.getAttribute('target') === '_blank') {
      element.setAttribute('rel', 'noopener noreferrer nofollow');
    }
    if (tag === 'input') {
      element.setAttribute('disabled', '');
    }
    if (tag === 'iframe') {
      if (!element.getAttribute('src')) {
        element.remove();
        continue;
      }
      element.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-presentation allow-popups');
      element.setAttribute('loading', 'lazy');
    }
    cleanNode(element);
  }
}

export function sanitizeEditorHtml(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  const Parser = globalThis.DOMParser;
  if (!Parser) {
    return '';
  }
  const body = new Parser().parseFromString(`<body>${html}</body>`, 'text/html').body;
  cleanNode(body);
  return body.innerHTML;
}
