import { ViewportScroller } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

export function pagePath(url: string): string {
  return url.split(/[?#]/)[0];
}

export function snapshotPath(snapshot: ActivatedRouteSnapshot): string {
  const segments: string[] = [];
  let current: ActivatedRouteSnapshot | null = snapshot;
  while (current) {
    segments.push(...current.url.map((segment) => segment.path));
    current = current.firstChild;
  }
  return segments.join('/');
}

export function scrollToTopOnPageChange(): void {
  const router = inject(Router);
  const scroller = inject(ViewportScroller);
  let path: string | null = null;
  router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)).subscribe((event) => {
    const next = pagePath(event.urlAfterRedirects);
    const hasFragment = !!router.parseUrl(event.urlAfterRedirects).fragment;
    if (path !== null && next !== path && !hasFragment) {
      scroller.scrollToPosition([0, 0]);
    }
    path = next;
  });
}
