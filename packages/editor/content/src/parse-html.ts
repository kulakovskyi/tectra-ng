export function parseHtmlBody(html: string, document?: Document | null): HTMLElement | null {
  const Parser = globalThis.DOMParser;
  if (Parser) {
    return new Parser().parseFromString(`<body>${html}</body>`, 'text/html').body;
  }
  const inert = document?.implementation.createHTMLDocument('');
  if (!inert) {
    return null;
  }
  inert.body.innerHTML = html;
  return inert.body;
}
