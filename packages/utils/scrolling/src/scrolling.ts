import { ViewportScroller } from '@angular/common';
import { DOCUMENT, DestroyRef, EnvironmentProviders, inject, makeEnvironmentProviders, provideEnvironmentInitializer } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

function pathOf(router: Router, url: string): string {
  const tree = router.parseUrl(url);
  tree.queryParams = {};
  tree.fragment = null;
  return router.serializeUrl(tree);
}

function setUpScrolling(): void {
  const view = inject(DOCUMENT).defaultView;
  if (!view) {
    return;
  }
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  const positions = new Map<number, [number, number]>();
  let currentId = 0;
  let currentPath: string | undefined;
  let popstate = false;
  let restoreId = 0;
  let pending: (() => void) | undefined;

  const later = (scroll: () => void) => {
    pending?.();
    let done = false;
    const run = () => {
      if (!done) {
        done = true;
        scroll();
      }
    };
    const timer = view.setTimeout(run);
    const frame = view.requestAnimationFrame?.(run);
    pending = () => {
      done = true;
      view.clearTimeout(timer);
      if (frame !== undefined) {
        view.cancelAnimationFrame?.(frame);
      }
    };
  };

  scroller.setHistoryScrollRestoration('manual');
  const subscription = router.events.subscribe((event) => {
    if (event instanceof NavigationStart) {
      positions.set(currentId, scroller.getScrollPosition());
      popstate = event.navigationTrigger === 'popstate';
      restoreId = event.restoredState?.navigationId ?? 0;
      return;
    }
    if (!(event instanceof NavigationEnd)) {
      return;
    }
    const previousPath = currentPath;
    currentId = event.id;
    currentPath = pathOf(router, event.urlAfterRedirects);
    const saved = popstate ? positions.get(restoreId) : undefined;
    if (saved) {
      later(() => scroller.scrollToPosition(saved));
    } else if (previousPath !== undefined && !router.parseUrl(event.urlAfterRedirects).fragment && currentPath !== previousPath) {
      later(() => scroller.scrollToPosition([0, 0]));
    }
  });
  inject(DestroyRef).onDestroy(() => {
    pending?.();
    subscription.unsubscribe();
  });
}

export function provideTxScrolling(): EnvironmentProviders {
  return makeEnvironmentProviders([provideEnvironmentInitializer(setUpScrolling)]);
}
