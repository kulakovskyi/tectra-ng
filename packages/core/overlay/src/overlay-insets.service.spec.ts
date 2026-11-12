import { TestBed } from '@angular/core/testing';
import { TECTRA_CONFIG } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { TxOverlayInsets, txViewportMargin } from './overlay-insets.service';

function element(style: Partial<CSSStyleDeclaration>, top: number, height: number): HTMLElement {
  const node = document.createElement('div');
  Object.assign(node.style, style);
  node.getBoundingClientRect = () => ({ top, bottom: top + height, height, left: 0, right: 100, width: 100, x: 0, y: top, toJSON: () => ({}) });
  document.body.appendChild(node);
  return node;
}

describe('TxOverlayInsets', () => {
  afterEach(() => document.body.replaceChildren());

  it('counts only chrome that is pinned right now', () => {
    const insets = TestBed.inject(TxOverlayInsets);
    insets.register(element({ position: 'sticky', top: '0px' }, 0, 56));
    const tabs = element({ position: 'sticky', top: '56px' }, 300, 50);
    const unregister = insets.register(tabs);
    expect(insets.measure()).toEqual({ top: 56, bottom: 0 });

    tabs.getBoundingClientRect = () => ({ top: 56, bottom: 106, height: 50, left: 0, right: 100, width: 100, x: 0, y: 56, toJSON: () => ({}) });
    expect(insets.measure()).toEqual({ top: 106, bottom: 0 });

    unregister();
    expect(insets.measure()).toEqual({ top: 56, bottom: 0 });
  });

  it('measures fixed footers from the bottom and ignores hidden chrome', () => {
    const insets = TestBed.inject(TxOverlayInsets);
    insets.register(element({ position: 'fixed', bottom: '0px' }, innerHeight - 40, 40));
    insets.register(element({ position: 'fixed', top: '0px' }, 0, 0));
    expect(insets.measure()).toEqual({ top: 0, bottom: 40 });
  });

  it('ignores chrome that scrolls with the page and counts a footer stuck to the bottom', () => {
    const insets = TestBed.inject(TxOverlayInsets);
    insets.register(element({ position: 'static' }, 0, 56));
    insets.register(element({ position: 'sticky', bottom: '0px' }, innerHeight - 30, 30));
    insets.register(element({ position: 'sticky', bottom: '0px' }, 200, 30));
    expect(insets.measure()).toEqual({ top: 0, bottom: 30 });
  });

  it('starts from the configured insets', () => {
    TestBed.configureTestingModule({ providers: [{ provide: TECTRA_CONFIG, useValue: { preset: Tectra, overlay: { viewportInsets: { top: 64 } } } }] });
    expect(TestBed.inject(TxOverlayInsets).measure()).toEqual({ top: 64, bottom: 0 });
  });

  it('turns insets into a viewport margin', () => {
    expect(txViewportMargin({ top: 56, bottom: 0 }, 8)).toEqual({ top: 64, bottom: 8, start: 8, end: 8 });
  });
});
