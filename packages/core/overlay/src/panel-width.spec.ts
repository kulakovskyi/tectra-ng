import { TxPanelWidth } from './panel-width';

function page(width: number): Document {
  const document = window.document.implementation.createHTMLDocument('');
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width });
  return document;
}

function element(document: Document, width: number): HTMLElement {
  const node = document.createElement('div');
  Object.defineProperty(node, 'offsetWidth', { value: width });
  document.body.appendChild(node);
  return node;
}

function label(panel: HTMLElement, scrollWidth: number, clientWidth: number): void {
  const node = panel.ownerDocument.createElement('span');
  node.className = 'label';
  Object.defineProperty(node, 'scrollWidth', { value: scrollWidth });
  Object.defineProperty(node, 'clientWidth', { value: clientWidth });
  panel.appendChild(node);
}

describe('TxPanelWidth', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.document.body.replaceChildren();
  });

  it('has no styles until the panel opens', () => {
    expect(new TxPanelWidth().style()).toEqual({});
  });

  it('grows with the content from the field width up to the cap and the viewport', () => {
    const document = page(1440);
    const width = new TxPanelWidth({ maxWidth: 'var(--cap)' });
    width.open(element(document, 160));
    expect(width.style()).toEqual({ 'min-width': '160px', 'max-width': 'min(max(var(--cap), 160px), 1424px)', width: 'max-content' });
  });

  it('keeps the panel inside a narrow viewport', () => {
    const document = page(375);
    const width = new TxPanelWidth({ maxWidth: '400px', margin: 12 });
    width.open(element(document, 420));
    expect(width.style()).toEqual({ 'min-width': '351px', 'max-width': 'min(max(400px, 420px), 351px)', width: 'max-content' });
  });

  it('caps a panel that does not follow its origin by the cap alone', () => {
    const document = page(1000);
    const width = new TxPanelWidth({ maxWidth: '400px', matchOrigin: false });
    width.open(element(document, 60));
    expect(width.style()).toEqual({ 'max-width': 'min(400px, 984px)', width: 'max-content' });
  });

  it('only clamps a panel with its own size to the viewport', () => {
    const document = page(375);
    const width = new TxPanelWidth({ fitContent: false });
    width.open(element(document, 200));
    expect(width.style()).toEqual({ 'min-width': '200px', 'max-width': '359px' });
    const free = new TxPanelWidth({ matchOrigin: false, fitContent: false });
    free.open(element(document, 200));
    expect(free.style()).toEqual({ 'max-width': '359px' });
  });

  it('leaves the viewport out when it has no size, as on the server', () => {
    const document = page(0);
    const capped = new TxPanelWidth({ maxWidth: '400px' });
    capped.open(element(document, 100));
    expect(capped.style()).toEqual({ 'min-width': '100px', 'max-width': 'max(400px, 100px)', width: 'max-content' });
    const free = new TxPanelWidth({ fitContent: false });
    free.open(element(document, 100));
    expect(free.style()).toEqual({ 'min-width': '100px' });
  });

  it('measures an origin that is not an HTML element by its box', () => {
    const document = page(800);
    const origin = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    origin.getBoundingClientRect = () => ({ width: 120 }) as DOMRect;
    const width = new TxPanelWidth({ fitContent: false });
    width.open(origin);
    expect(width.style()['min-width']).toBe('120px');
  });

  it('keeps the width the panel opened with, widened by cut labels within the cap', () => {
    const document = page(1440);
    const width = new TxPanelWidth({ maxWidth: '400px' });
    width.open(element(document, 160));
    const panel = element(window.document, 180);
    label(panel, 260, 150);
    label(panel, 90, 120);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ width: '180.4px', maxWidth: '400px' } as CSSStyleDeclaration);
    width.lock(panel, '.label');
    expect(panel.style.width).toBe('291px');
    expect(width.style()['width']).toBe('291px');

    label(panel, 900, 100);
    width.lock(panel, '.label');
    expect(panel.style.width).toBe('291px');
  });

  it('stops at the cap and falls back to the offset width without computed sizes', () => {
    const document = page(1440);
    const width = new TxPanelWidth({ maxWidth: '400px' });
    width.open(element(document, 160));
    const panel = element(window.document, 380);
    label(panel, 500, 100);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ width: '', maxWidth: '399.6px' } as CSSStyleDeclaration);
    width.lock(panel, '.label');
    expect(panel.style.width).toBe('399px');
  });

  it('keeps the measured width when the panel has no max width', () => {
    const document = page(1440);
    const width = new TxPanelWidth();
    width.open(element(document, 160));
    const panel = element(window.document, 210);
    vi.spyOn(window, 'getComputedStyle').mockReturnValue({ width: '210px', maxWidth: 'none' } as CSSStyleDeclaration);
    width.lock(panel);
    expect(width.style()['width']).toBe('210px');
  });

  it('does not lock before it opens, without a panel or for a panel with its own size', () => {
    const document = page(1440);
    const panel = element(document, 200);
    const closed = new TxPanelWidth();
    closed.lock(panel);
    expect(panel.style.width).toBe('');

    const opened = new TxPanelWidth();
    opened.open(element(document, 100));
    opened.lock(null);
    expect(opened.style()['width']).toBe('max-content');

    const fixed = new TxPanelWidth({ fitContent: false });
    fixed.open(element(document, 100));
    fixed.lock(panel);
    expect(panel.style.width).toBe('');
  });

  it('measures again on the next open', () => {
    const document = page(1440);
    const width = new TxPanelWidth();
    width.open(element(document, 100));
    const panel = element(document, 200);
    width.lock(panel);
    expect(width.style()['width']).toBe('200px');
    width.open(element(document, 120));
    expect(width.style()).toEqual({ 'min-width': '120px', 'max-width': '1424px', width: 'max-content' });
  });
});
