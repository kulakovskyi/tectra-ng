import { DestroyRef, Injectable, InjectionToken, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, isObservable, of, switchMap } from 'rxjs';

/** Settings of the tab title, passed to `provideTxTitle`. */
export interface TxTitleConfig {
  /** App name shown after the page title. */
  appName: string;
  /** Text between the page title and the app name (default ` · `). */
  separator?: string;
  /** Turns the title of a route into the shown text, as a string or an observable. */
  translate?: (page: string) => string | Observable<string>;
}

/** Options of `TxTitle.setPage`. */
export interface TxTitlePageOptions {
  /** `false` shows the text as it is, without the `translate` function of the config (default `true`). */
  translate?: boolean;
}

/** App name, separator and translation of page titles; set with `provideTxTitle`. */
export const TX_TITLE_CONFIG = new InjectionToken<TxTitleConfig>('TX_TITLE_CONFIG');

/** Builds the tab title as "prefix page · app"; set the page and a prefix such as a counter. */
@Injectable()
export class TxTitle {
  private readonly title = inject(Title);
  private readonly config = inject(TX_TITLE_CONFIG);
  private readonly page$ = new BehaviorSubject<{ text: string | undefined; translate: boolean }>({ text: undefined, translate: true });
  private readonly prefix$ = new BehaviorSubject<string>('');
  private touched = false;

  constructor() {
    combineLatest([this.page$.pipe(switchMap(({ text, translate }) => (translate ? this.translate(text) : of(text)))), this.prefix$])
      .pipe(
        filter(() => this.touched),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(([page, prefix]) => {
        const separator = this.config.separator ?? ' · ';
        const title = page ? `${page}${separator}${this.config.appName}` : this.config.appName;
        this.title.setTitle(prefix ? `${prefix} ${title}` : title);
      });
  }

  setPage(page: string | undefined, options?: TxTitlePageOptions): void {
    this.touched = true;
    this.page$.next({ text: page, translate: options?.translate ?? true });
  }

  setPrefix(prefix: string): void {
    this.touched = true;
    this.prefix$.next(prefix);
  }

  private translate(page: string | undefined): Observable<string | undefined> {
    if (!page || !this.config.translate) {
      return of(page);
    }
    const translated = this.config.translate(page);
    return isObservable(translated) ? translated : of(translated);
  }
}

/** Router title strategy that sets the page part of the tab title through `TxTitle`. */
@Injectable()
export class TxTitleStrategy extends TitleStrategy {
  private readonly txTitle = inject(TxTitle);

  /** Sets the page title from the route titles after each navigation. */
  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.txTitle.setPage(this.buildTitle(snapshot));
  }
}

export function provideTxTitle(config: TxTitleConfig): Provider[] {
  return [{ provide: TX_TITLE_CONFIG, useValue: config }, TxTitle, { provide: TitleStrategy, useClass: TxTitleStrategy }];
}
