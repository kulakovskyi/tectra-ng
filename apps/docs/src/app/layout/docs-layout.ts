import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TxThemeService } from '@tectra/core/config';
import { TxIcon } from '@tectra/icons';
import { createInkPreset } from '@tectra/themes';
import { TectraAccent } from '@tectra/tokens';
import { TxButton } from '@tectra/ui/button';
import { DOC_COMPONENTS } from '../../generated/registry';
import { HEADER_LINKS } from '../data/header-links.data';
import { DOC_NAVIGATION } from '../data/navigation.data';
import { THEME_ACCENTS } from '../data/theme-accents.data';

@Component({
  selector: 'docs-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TxButton, TxIcon],
  templateUrl: './docs-layout.html',
  styleUrl: './docs-layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocsLayout {
  private txThemeService = inject(TxThemeService);
  private document = inject(DOCUMENT);

  readonly navigation = DOC_NAVIGATION;
  readonly headerLinks = HEADER_LINKS;
  readonly accents = THEME_ACCENTS;
  readonly componentCount = DOC_COMPONENTS.length;
  readonly mode = this.txThemeService.mode;

  isMenuOpen = signal(false);
  currentAccent = computed(() => this.txThemeService.preset()?.name.replace('ink-', '') ?? 'blue');

  setAccent(accent: TectraAccent): void {
    this.txThemeService.applyPreset(createInkPreset(accent));
  }

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
