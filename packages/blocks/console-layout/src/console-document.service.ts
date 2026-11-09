import { DOCUMENT, Injectable, OnDestroy, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable()
export class TxConsoleDocument implements OnDestroy {
  private readonly title = inject(Title);
  private readonly document = inject(DOCUMENT);

  private initialTitle: string | null = null;
  private initialFavicon: string | null = null;

  setTitle(title: string): void {
    this.initialTitle ??= this.title.getTitle();
    this.title.setTitle(title);
  }

  setFavicon(href: string): void {
    const link = this.faviconLink();
    if (!link) {
      return;
    }
    this.initialFavicon ??= link.getAttribute('href') ?? '';
    link.setAttribute('href', href);
  }

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
