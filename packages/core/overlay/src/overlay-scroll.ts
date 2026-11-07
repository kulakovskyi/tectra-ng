import { ScrollStrategy, createNoopScrollStrategy, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, Injector } from '@angular/core';

export type ScrollAxis = 'block' | 'inline';
export type ScrollTimelineConstructor = new (options: { source: Element; axis: ScrollAxis }) => AnimationTimeline;

interface TimelineWindow {
  ScrollTimeline?: ScrollTimelineConstructor;
  Animation?: { prototype: object };
}

export function scrollTimeline(view: Window | null): ScrollTimelineConstructor | undefined {
  const scope = view as unknown as TimelineWindow | null;
  const ranged = !!scope?.Animation && 'rangeEnd' in scope.Animation.prototype;
  return ranged ? scope?.ScrollTimeline : undefined;
}

export function txFollowsScroll(view: Window | null): boolean {
  return typeof scrollTimeline(view) === 'function';
}

export function txScrollStrategy(injector: Injector): ScrollStrategy {
  return txFollowsScroll(injector.get(DOCUMENT).defaultView) ? createNoopScrollStrategy() : createRepositionScrollStrategy(injector);
}
