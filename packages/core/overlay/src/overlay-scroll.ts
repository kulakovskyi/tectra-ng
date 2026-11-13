import { ScrollStrategy, createNoopScrollStrategy, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, Injector } from '@angular/core';

/** Scroll direction of a scroll timeline. */
export type ScrollAxis = 'block' | 'inline';
/** Constructor of the browser `ScrollTimeline`. */
export type ScrollTimelineConstructor = new (options: { source: Element; axis: ScrollAxis }) => AnimationTimeline;

interface TimelineWindow {
  ScrollTimeline?: ScrollTimelineConstructor;
  Animation?: { prototype: object };
}

/**
 * The `ScrollTimeline` constructor when the browser supports scroll-driven animations with ranges;
 * `undefined` otherwise.
 */
export function scrollTimeline(view: Window | null): ScrollTimelineConstructor | undefined {
  const scope = view as unknown as TimelineWindow | null;
  const ranged = !!scope?.Animation && 'rangeEnd' in scope.Animation.prototype;
  return ranged ? scope?.ScrollTimeline : undefined;
}

/** Tells whether the browser can animate an overlay along with the scroll of its origin. */
export function txFollowsScroll(view: Window | null): boolean {
  return typeof scrollTimeline(view) === 'function';
}

/**
 * CDK scroll strategy that repositions an overlay on scroll, or does nothing where the browser moves it along
 * with its origin.
 */
export function txScrollStrategy(injector: Injector): ScrollStrategy {
  return txFollowsScroll(injector.get(DOCUMENT).defaultView) ? createNoopScrollStrategy() : createRepositionScrollStrategy(injector);
}
