import { ScrollStrategy, createNoopScrollStrategy, createRepositionScrollStrategy } from '@angular/cdk/overlay';
import { DOCUMENT, Injector } from '@angular/core';

export type ScrollAxis = 'block' | 'inline';
export type ScrollTimelineConstructor = new (options: { source: Element; axis: ScrollAxis }) => AnimationTimeline;

export function scrollTimeline(view: Window | null): ScrollTimelineConstructor | undefined {
  return (view as unknown as { ScrollTimeline?: ScrollTimelineConstructor } | null)?.ScrollTimeline;
}

export function txFollowsScroll(view: Window | null): boolean {
  return typeof scrollTimeline(view) === 'function';
}

export function txScrollStrategy(injector: Injector): ScrollStrategy {
  return txFollowsScroll(injector.get(DOCUMENT).defaultView) ? createNoopScrollStrategy() : createRepositionScrollStrategy(injector);
}
