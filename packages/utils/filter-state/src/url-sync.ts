import { DestroyRef, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, NavigationStart, Router, UrlTree } from '@angular/router';
import { filter, pairwise, startWith } from 'rxjs';
import { filtersToQueryParams, isSameValue, queryParamsToFilters } from './url-filters.functions';

export class TxUrlSync<T extends object> {
  private readonly path: string;
  private written = false;

  constructor(
    private readonly router: Router,
    private readonly initial: () => T,
    destroyRef: DestroyRef,
    onHistory: (filters: T) => void,
  ) {
    this.path = this.pathOf(this.currentTree());
    router.events
      .pipe(
        filter((event) => event instanceof NavigationStart || event instanceof NavigationEnd),
        startWith(null),
        pairwise(),
        filter(([previous, current]) => current instanceof NavigationEnd && previous instanceof NavigationStart && previous.navigationTrigger === 'popstate'),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => {
        const tree = router.parseUrl(router.url);
        if (this.pathOf(tree) === this.path) {
          onHistory(queryParamsToFilters(tree.queryParams, this.initial()) ?? this.initial());
        }
      });
  }

  read(): T | null {
    return queryParamsToFilters(this.currentTree().queryParams, this.initial());
  }

  write(filters: T): void {
    const tree = this.router.parseUrl(this.router.url);
    const replaceUrl = !this.written;
    this.written = true;
    if (this.pathOf(tree) !== this.path) {
      return;
    }
    const queryParams = { ...tree.queryParams };
    Object.entries(filtersToQueryParams(filters, this.initial())).forEach(([key, value]) => {
      if (value === null) {
        delete queryParams[key];
      } else {
        queryParams[key] = value;
      }
    });
    if (isSameValue(queryParams, tree.queryParams)) {
      return;
    }
    tree.queryParams = queryParams;
    void this.router.navigateByUrl(tree, { replaceUrl });
  }

  private currentTree(): UrlTree {
    return untracked(() => this.router.currentNavigation()?.finalUrl) ?? this.router.parseUrl(this.router.url);
  }

  private pathOf(tree: UrlTree): string {
    return this.router.serializeUrl(tree).split(/[?#]/)[0];
  }
}
