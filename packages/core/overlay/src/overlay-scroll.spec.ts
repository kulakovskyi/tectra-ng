import { NoopScrollStrategy, RepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { scrollTimeline, txFollowsScroll, txScrollStrategy } from './overlay-scroll';

class FakeTimeline {}

function scrollView(ranged: boolean): Window {
  const prototype = ranged ? { rangeEnd: 'normal' } : {};
  return { Animation: { prototype }, ScrollTimeline: FakeTimeline } as unknown as Window;
}

describe('overlay scroll', () => {
  it('follows the scroll with a ranged scroll timeline only', () => {
    expect(scrollTimeline(scrollView(true))).toBe(FakeTimeline);
    expect(txFollowsScroll(scrollView(true))).toBe(true);
    expect(txFollowsScroll(scrollView(false))).toBe(false);
    expect(txFollowsScroll(null)).toBe(false);
  });

  it('does nothing on scroll when the overlay follows by itself and repositions otherwise', () => {
    const document = { defaultView: scrollView(true) } as unknown as Document;
    const injector = Injector.create({ providers: [{ provide: DOCUMENT, useValue: document }], parent: TestBed.inject(Injector) });
    expect(txScrollStrategy(injector)).toBeInstanceOf(NoopScrollStrategy);
    expect(txScrollStrategy(TestBed.inject(Injector))).toBeInstanceOf(RepositionScrollStrategy);
  });
});
