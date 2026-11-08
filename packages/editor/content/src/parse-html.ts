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

export function appendNodes(parent: Node, nodes: Iterable<Node>): void {
  for (const node of Array.from(nodes)) {
    parent.appendChild(node);
  }
}

export function replaceNode(node: Node, replacement: Node): void {
  node.parentNode?.replaceChild(replacement, node);
}

export function unwrapNode(node: Node): void {
  const parent = node.parentNode;
  if (!parent) {
    return;
  }
  for (const child of Array.from(node.childNodes)) {
    parent.insertBefore(child, node);
  }
  parent.removeChild(node);
}
