import { DOCUMENT, isPlatformBrowser, ViewportScroller } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
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

@Injectable()
export class DocsViewportScroller implements ViewportScroller {
  private document = inject(DOCUMENT);
  private window = isPlatformBrowser(inject(PLATFORM_ID)) ? this.document.defaultView : null;

  setOffset(): void {
    return;
  }

  getScrollPosition(): [number, number] {
    return this.window ? [this.window.scrollX, this.window.scrollY] : [0, 0];
  }

  scrollToPosition(position: [number, number], options?: ScrollOptions): void {
    this.window?.scrollTo({ ...options, left: position[0], top: position[1] });
  }

  scrollToAnchor(anchor: string, options?: ScrollOptions): void {
    if (!this.window) {
      return;
    }
    const target = this.document.getElementById(anchor) ?? this.document.getElementsByName(anchor)[0];
    target?.scrollIntoView({ ...options, block: 'start', inline: 'nearest' });
    target?.focus({ preventScroll: true });
  }

  setHistoryScrollRestoration(scrollRestoration: 'auto' | 'manual'): void {
    try {
      if (this.window) {
        this.window.history.scrollRestoration = scrollRestoration;
      }
    } catch {
      return;
    }
  }
}
