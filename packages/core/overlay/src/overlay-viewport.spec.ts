import { txCrossShift, txLayoutOrigin, txLayoutShift } from './overlay-viewport';

function page(width: number, height: number): Document {
  const document = window.document.implementation.createHTMLDocument('');
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: height });
  return document;
}

function pane(document: Document, placement: string, style: Partial<CSSStyleDeclaration>, size: number): HTMLElement {
  const element = document.createElement('div');
  element.classList.add('cdk-overlay-pane', `tx-placement-${placement}`);
  Object.assign(element.style, style);
  Object.defineProperty(element, 'offsetWidth', { value: size });
  Object.defineProperty(element, 'offsetHeight', { value: size });
  document.body.appendChild(element);
  return element;
}

describe('overlay viewport helpers', () => {
  it('reads the page scroll when there is no visual viewport', () => {
    const document = page(1000, 800);
    expect(txLayoutShift(document)).toEqual({ x: 0, y: 0 });
    expect(txLayoutOrigin(document)).toEqual({ x: 0, y: 0 });
    Object.defineProperty(document, 'scrollingElement', { value: null });
    expect(txLayoutOrigin(document)).toEqual({ x: 0, y: 0 });
  });

  it('pulls a side panel placed from the bottom back inside the margin', () => {
    const document = page(1000, 800);
    expect(txCrossShift(pane(document, 'right-start', { bottom: '2px' }, 100), 8)).toEqual({ x: 0, y: -6 });
    expect(txCrossShift(pane(document, 'left', { top: '2px' }, 100), 8)).toEqual({ x: 0, y: 6 });
  });

  it('pulls a top or bottom panel placed from the right back inside the margin', () => {
    const document = page(1000, 800);
    expect(txCrossShift(pane(document, 'bottom-end', { right: '2px' }, 100), 8)).toEqual({ x: -6, y: 0 });
  });

  it('leaves panels without a placement or an inset alone', () => {
    const document = page(1000, 800);
    expect(txCrossShift(pane(document, 'unknown', {}, 100), 8)).toEqual({ x: 0, y: 0 });
    const plain = document.createElement('div');
    expect(txCrossShift(plain, 8)).toEqual({ x: 0, y: 0 });
    expect(txCrossShift(pane(document, 'left', {}, 100), 8)).toEqual({ x: 0, y: 0 });
  });
});
