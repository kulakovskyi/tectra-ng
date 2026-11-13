import { DOCUMENT, DestroyRef, ElementRef, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/** Length of the entrance animation of a chart, in ms. */
export const TX_CHART_ENTER_MS = 1100;

/** Entrance animation state of a chart. */
export interface TxChartEntrance {
  /** `true` while the entrance animation runs. */
  readonly active: Signal<boolean>;
  /** Starts the entrance animation; does nothing on the server or with reduced motion. */
  play(): void;
}

/** Whether the user asked for reduced motion. */
export function prefersReducedMotion(document: Document): boolean {
  return document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

/**
 * Entrance animation for the chart in the current injection context; plays once when the chart renders
 * in the browser.
 */
export function injectChartEntrance(): TxChartEntrance {
  const host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  const document = inject(DOCUMENT);
  const browser = isPlatformBrowser(inject(PLATFORM_ID));
  const active = signal(false);
  let timer: ReturnType<typeof setTimeout> | undefined;
  inject(DestroyRef).onDestroy(() => clearTimeout(timer));

  const play = () => {
    if (!browser || prefersReducedMotion(document)) {
      return;
    }
    clearTimeout(timer);
    active.set(true);
    timer = setTimeout(() => active.set(false), TX_CHART_ENTER_MS);
  };

  if (browser && !host.hasChildNodes()) {
    play();
  }

  return { active: active.asReadonly(), play };
}
