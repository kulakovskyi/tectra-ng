import { DOCUMENT, DestroyRef, ElementRef, PLATFORM_ID, Signal, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const TX_CHART_ENTER_MS = 1100;

export interface TxChartEntrance {
  readonly active: Signal<boolean>;
  play(): void;
}

export function prefersReducedMotion(document: Document): boolean {
  return document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

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
