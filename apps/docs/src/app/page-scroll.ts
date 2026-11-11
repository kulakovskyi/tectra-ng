import { ViewportScroller } from '@angular/common';
import { inject } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
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

export function routePath(route: ActivatedRoute): string {
  return `/${route.snapshot.pathFromRoot.flatMap((item) => item.url.map((segment) => segment.path)).join('/')}`;
}

export function jumpToAnchor(event: MouseEvent, document: Document, href: string, id: string): void {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
    return;
  }
  event.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  document.defaultView?.history.replaceState(document.defaultView.history.state, '', href);
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
