import { DOCUMENT, Injectable, OnDestroy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

/** Sets the browser tab title and icon while a console is open and puts the old ones back when it closes. */
@Injectable()
export class TxConsoleDocument implements OnDestroy {
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  private initialTitle: string | null = null;
  private initialFavicon: string | null = null;

  /** Sets the tab title; the first title is kept to restore later. */
  setTitle(title: string): void {
    this.initialTitle ??= this.title.getTitle();
    this.title.setTitle(title);
  }

  /** Sets the tab icon; the first icon is kept to restore later. */
  setFavicon(href: string): void {
    const link = this.faviconLink();
    if (!link) {
      return;
    }
    this.initialFavicon ??= link.getAttribute('href') ?? '';
    link.setAttribute('href', href);
  }

  /** Puts the original tab title and icon back. */
  ngOnDestroy(): void {
    if (this.initialTitle !== null) {
      this.title.setTitle(this.initialTitle);
    }
    if (this.initialFavicon !== null) {
      this.faviconLink()?.setAttribute('href', this.initialFavicon);
    }
  }

  private faviconLink(): HTMLLinkElement | null {
    return this.document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  }
}
