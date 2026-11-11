import { DestroyRef, Injectable, InjectionToken, Provider, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { BehaviorSubject, Observable, combineLatest, filter, isObservable, of, switchMap } from 'rxjs';

export interface TxTitleConfig {
  appName: string;
  separator?: string;
  translate?: (page: string) => string | Observable<string>;
}

export const TX_TITLE_CONFIG = new InjectionToken<TxTitleConfig>('TX_TITLE_CONFIG');

@Injectable()
export class TxTitle {
  private readonly title = inject(Title);
  private readonly config = inject(TX_TITLE_CONFIG);
  private readonly page$ = new BehaviorSubject<string | undefined>(undefined);
  private readonly prefix$ = new BehaviorSubject<string>('');
  private touched = false;

  constructor() {
    combineLatest([this.page$.pipe(switchMap((page) => this.translate(page))), this.prefix$])
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

  setPage(page: string | undefined): void {
    this.touched = true;
    this.page$.next(page);
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

@Injectable()
export class TxTitleStrategy extends TitleStrategy {
  private readonly txTitle = inject(TxTitle);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    this.txTitle.setPage(this.buildTitle(snapshot));
  }
}

export function provideTxTitle(config: TxTitleConfig): Provider[] {
  return [{ provide: TX_TITLE_CONFIG, useValue: config }, TxTitle, { provide: TitleStrategy, useClass: TxTitleStrategy }];
}
