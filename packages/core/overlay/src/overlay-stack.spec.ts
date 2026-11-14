import { TestBed } from '@angular/core/testing';
import { TxOverlayStack } from './overlay-stack';

type FakePopover = HTMLElement & { shown: boolean; calls: string[] };

function popoverElement(): FakePopover {
  const element = Object.assign(document.createElement('div'), { shown: false, calls: [] as string[] });
  Object.assign(element, {
    showPopover() {
      element.shown = true;
      element.calls.push('show');
    },
    hidePopover() {
      element.shown = false;
      element.calls.push('hide');
    },
    matches(selector: string) {
      if (selector === ':popover-open') {
        return element.shown;
      }
      return false;
    },
  });
  return element;
}

describe('TxOverlayStack', () => {
  it('closes every transient overlay once and forgets removed ones', () => {
    const stack = TestBed.inject(TxOverlayStack);
    const closed: string[] = [];
    stack.addTransient(() => closed.push('menu'));
    const forget = stack.addTransient(() => closed.push('tooltip'));
    stack.addTransient(() => closed.push('popover'));
    forget();
    stack.closeTransient();
    stack.closeTransient();
    expect(closed).toEqual(['menu', 'popover']);
  });

  it('keeps an element in the top layer and raises it above a newer modal', () => {
    const stack = TestBed.inject(TxOverlayStack);
    const toast = popoverElement();
    const stop = stack.keepOnTop(toast);
    expect(toast.getAttribute('popover')).toBe('manual');
    expect(toast.calls).toEqual(['show']);
    stack.raise();
    expect(toast.calls).toEqual(['show', 'hide', 'show']);
    toast.hidePopover();
    stack.raise();
    expect(toast.calls).toEqual(['show', 'hide', 'show', 'hide']);
    stop();
    toast.showPopover();
    stack.raise();
    expect(toast.calls).toEqual(['show', 'hide', 'show', 'hide', 'show']);
  });

  it('keeps an own popover attribute, skips a shown element and ignores browsers without popovers', () => {
    const stack = TestBed.inject(TxOverlayStack);
    const toast = popoverElement();
    toast.setAttribute('popover', 'auto');
    toast.shown = true;
    stack.keepOnTop(toast)();
    expect(toast.getAttribute('popover')).toBe('auto');
    expect(toast.calls).toEqual([]);
    const plain = document.createElement('div');
    stack.keepOnTop(plain)();
    expect(plain.hasAttribute('popover')).toBe(false);
  });

  it('treats an element as hidden when the browser cannot match open popovers', () => {
    const stack = TestBed.inject(TxOverlayStack);
    const toast = popoverElement();
    stack.keepOnTop(toast);
    Object.assign(toast, {
      matches() {
        throw new SyntaxError('unsupported');
      },
    });
    stack.raise();
    expect(toast.calls).toEqual(['show']);
  });
});
