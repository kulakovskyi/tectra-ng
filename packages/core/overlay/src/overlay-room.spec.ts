import { CdkConnectedOverlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxOverlayRoom } from './overlay-room';
import { placementFromPosition, txPositions } from './placements';

function page(width: number, height: number): Document {
  const document = window.document.implementation.createHTMLDocument('');
  Object.defineProperty(document.documentElement, 'clientWidth', { value: width });
  Object.defineProperty(document.documentElement, 'clientHeight', { value: height });
  return document;
}

function box(document: Document, rect: { top: number; left: number; width: number; height: number }): HTMLElement {
  const element = document.createElement('div');
  element.getBoundingClientRect = () => ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top, toJSON: () => ({}) });
  Object.defineProperty(element, 'offsetWidth', { value: rect.width });
  Object.defineProperty(element, 'offsetHeight', { value: rect.height });
  document.body.appendChild(element);
  return element;
}

describe('TxOverlayRoom', () => {
  const preferred = txPositions('bottom-start', 4);
  let updatePosition: ReturnType<typeof vi.fn>;
  let overlay: CdkConnectedOverlay;
  let injector: Injector;

  beforeEach(() => {
    updatePosition = vi.fn();
    overlay = { overlayRef: { updatePosition } } as unknown as CdkConnectedOverlay;
    injector = TestBed.inject(Injector);
  });

  it('starts with the preferred positions and keeps the bottom inset clear', () => {
    const room = new TxOverlayRoom(preferred);
    expect(room.positions()).toBe(preferred);
    expect(room.viewportMargin()).toEqual({ top: 0, bottom: 8, start: 8, end: 8 });
    room.move({ top: 56, bottom: 40 });
    expect(room.viewportMargin()).toEqual({ top: 0, bottom: 48, start: 8, end: 8 });
  });

  it('flips to the side with room and repositions after the next render', () => {
    const document = page(1000, 800);
    const origin = box(document, { top: 700, left: 10, width: 100, height: 30 });
    const panel = box(document, { top: 0, left: 0, width: 200, height: 200 });
    const room = new TxOverlayRoom(preferred, 8);

    expect(room.fit(origin, null, overlay, injector)).toBe(false);
    expect(room.fit(origin, panel, overlay, injector)).toBe(true);
    expect(placementFromPosition(room.positions()[0])).toBe('top-start');
    expect(updatePosition).not.toHaveBeenCalled();
    TestBed.tick();
    expect(updatePosition).toHaveBeenCalledTimes(1);

    expect(room.fit(origin, panel, overlay, injector)).toBe(false);
  });

  it('goes back to the preferred positions on open', () => {
    const document = page(1000, 800);
    const origin = box(document, { top: 700, left: 10, width: 100, height: 30 });
    const panel = box(document, { top: 0, left: 0, width: 200, height: 200 });
    const room = new TxOverlayRoom(preferred);
    room.fit(origin, panel, undefined, injector);
    room.open({ top: 0, bottom: 20 });
    expect(room.positions()).toBe(preferred);
    expect(room.viewportMargin()).toEqual({ top: 0, bottom: 28, start: 8, end: 8 });
  });

  it('follows the origin and only repositions in place when the placement stays', () => {
    const document = page(1000, 800);
    const origin = box(document, { top: 400, left: 10, width: 100, height: 30 });
    const panel = box(document, { top: 0, left: 0, width: 200, height: 200 });
    const room = new TxOverlayRoom(preferred);

    room.follow({ top: 0, bottom: 0 }, origin, panel, overlay, injector);
    expect(updatePosition).toHaveBeenCalledTimes(1);
    expect(room.positions()).toBe(preferred);

    room.follow({ top: 0, bottom: 0 }, origin, panel, undefined, injector);
    expect(updatePosition).toHaveBeenCalledTimes(1);

    room.follow({ top: 0, bottom: 200 }, origin, panel, overlay, injector);
    expect(placementFromPosition(room.positions()[0])).toBe('top-start');
    expect(updatePosition).toHaveBeenCalledTimes(1);
    expect(room.viewportMargin()).toEqual({ top: 0, bottom: 208, start: 8, end: 8 });
  });
});
