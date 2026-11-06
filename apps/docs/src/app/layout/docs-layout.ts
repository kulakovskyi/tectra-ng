import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';
import { TxThemeService } from '@tectra-ng/core/config';
import { TxOverlayInset } from '@tectra-ng/core/overlay';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxToast } from '@tectra-ng/ui/toast';
import { HEADER_LINKS } from '../data/header-links.data';
import { DocsSidebar } from './sidebar/docs-sidebar';
import { DocsThemeConfigurator } from './theme-configurator/theme-configurator';

@Component({
  selector: 'docs-layout',
  imports: [RouterOutlet, RouterLink, TxButton, TxPopover, TxPopoverTrigger, TxOverlayInset, DocsSidebar, DocsThemeConfigurator, TxToast],
  templateUrl: './docs-layout.html',
  styleUrl: './docs-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsLayout {
  private txThemeService = inject(TxThemeService);
  private document = inject(DOCUMENT);
  private router = inject(Router);

  readonly headerLinks = HEADER_LINKS;
  readonly mode = this.txThemeService.mode;

  readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  isMenuOpen = signal(false);
  toggleMode(event: MouseEvent): void {
    const root = this.document.documentElement;
    const reduceMotion = this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!this.document.startViewTransition || reduceMotion) {
      this.txThemeService.toggleMode();
      return;
    }
    const x = event.clientX || innerWidth - 40;
    const y = event.clientY || 28;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    root.classList.add('docs-theme-switch');
    const transition = this.document.startViewTransition(() => this.txThemeService.toggleMode());
    transition.ready.then(() =>
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.2, 0, 0, 1)', pseudoElement: '::view-transition-new(root)' },
      ),
    );
    transition.finished.finally(() => root.classList.remove('docs-theme-switch'));
  }

  toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
