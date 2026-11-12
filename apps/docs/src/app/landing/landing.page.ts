import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPublicHeader, TxPublicHeaderBrand } from '@tectra-ng/blocks/public-header';
import { TxThemeReveal } from '@tectra-ng/blocks/switch-theme';
import { TX_FLAG_CODES } from '@tectra-ng/flags';
import { TX_ICONS, TxIcon } from '@tectra-ng/icons';
import { COMPONENT_TOKENS, Tectra, toCssVariables } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { DOC_COMPONENTS } from '../../generated/registry';
import { INSTALL_COMMAND } from '../data/home.data';
import { REPOSITORY_URL } from '../data/seo.data';
import { DocsClipboard } from '../doc-ui/copy/clipboard.service';
import { DocsCopyIcon } from '../doc-ui/copy/copy-icon';
import { DocsLogo } from '../layout/logo/logo';
import { DocsSiteFooter } from '../layout/site-footer/site-footer';
import { DocsThemeSettings } from '../layout/theme-settings';
import {
  INSTALL_SNIPPET,
  LANDING_HERO,
  LANDING_HIGHLIGHTS,
  LANDING_NAV,
  LANDING_TILES,
  LANDING_WALL,
  LandingShot,
} from './landing.data';
import { DocsScrollProgress } from './scroll-progress.directive';

const IMAGE_ROOT = '/images/landing';

@Component({
  selector: 'docs-landing-page',
  imports: [RouterLink, TxPublicHeader, TxPublicHeaderBrand, TxThemeReveal, TxIcon, TxButton, DocsLogo, DocsScrollProgress, DocsCopyIcon, DocsSiteFooter],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPage {
  private readonly clipboard = inject(DocsClipboard);
  protected readonly settings = inject(DocsThemeSettings);

  readonly nav = LANDING_NAV;
  readonly wall = LANDING_WALL;
  readonly headerTokens = {
    nav: {
      linkHoverBackground: 'color-mix(in srgb, var(--tx-text-primary) 6%, transparent)',
      linkFontSize: '13px',
    },
  };
  readonly hero = LANDING_HERO;
  readonly highlights = LANDING_HIGHLIGHTS;
  readonly tiles = LANDING_TILES;
  readonly snippet = INSTALL_SNIPPET;
  readonly installCommand = INSTALL_COMMAND;
  readonly repository = REPOSITORY_URL;
  readonly copied = signal(false);

  readonly componentsLabel = `${Math.floor(DOC_COMPONENTS.length / 10) * 10}+`;
  readonly stats = [
    { value: DOC_COMPONENTS.length, suffix: '+', label: 'components and blocks' },
    { value: Object.keys(TX_ICONS).length, suffix: '', label: 'icons in one style' },
    { value: TX_FLAG_CODES.length, suffix: '', label: 'country flags' },
    { value: toCssVariables(Tectra.light).length + toCssVariables(COMPONENT_TOKENS).length, suffix: '+', label: 'design tokens' },
  ];

  protected readonly dark = computed(() => this.settings.mode() === 'dark');

  shot(shot: LandingShot, mode: 'light' | 'dark' = this.dark() ? 'dark' : 'light'): string {
    return `${IMAGE_ROOT}/${shot.name}-${mode}.${shot.extension}`;
  }

  count(value: number, progress: number): string {
    const eased = 1 - Math.pow(1 - progress, 3);
    return Math.round(value * eased).toLocaleString('en-US');
  }

  copyInstall(): void {
    this.clipboard.copy(this.installCommand);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1600);
  }
}
