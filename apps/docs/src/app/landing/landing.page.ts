import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPublicHeader, TxPublicHeaderBrand } from '@tectra-ng/blocks/public-header';
import { TxThemeReveal } from '@tectra-ng/blocks/switch-theme';
import { TxButton } from '@tectra-ng/ui/button';
import { REPOSITORY_URL } from '../data/seo.data';
import { DocsLogo } from '../layout/logo/logo';
import { DocsSiteFooter } from '../layout/site-footer/site-footer';
import { DocsThemeSettings } from '../layout/theme-settings';
import { LANDING_NAV } from './landing.data';
import { LandingCatalog } from './sections/catalog';
import { LandingClosing } from './sections/closing';
import { LandingFaq } from './sections/faq';
import { LandingFeatures } from './sections/features';
import { LandingGlue } from './sections/glue';
import { LandingHero } from './sections/hero';
import { LandingIntro } from './sections/intro';
import { LandingQuestions } from './sections/questions';
import { LandingStart } from './sections/start';
import { LandingStats } from './sections/stats';

@Component({
  selector: 'docs-landing-page',
  imports: [
    RouterLink,
    TxPublicHeader,
    TxPublicHeaderBrand,
    TxThemeReveal,
    TxButton,
    DocsLogo,
    DocsSiteFooter,
    LandingHero,
    LandingIntro,
    LandingQuestions,
    LandingFeatures,
    LandingGlue,
    LandingStats,
    LandingCatalog,
    LandingStart,
    LandingFaq,
    LandingClosing,
  ],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPage {
  protected readonly settings = inject(DocsThemeSettings);

  readonly nav = LANDING_NAV;
  readonly repository = REPOSITORY_URL;
  readonly headerTokens = {
    root: {
      height: '52px',
      paddingX: '10px',
      background: 'color-mix(in srgb, var(--tx-surface-card) 72%, transparent)',
    },
    nav: {
      linkHoverBackground: 'color-mix(in srgb, var(--tx-text-primary) 6%, transparent)',
      linkFontSize: '13px',
      linkColor: 'var(--tx-text-primary)',
    },
  };

  protected readonly dark = computed(() => this.settings.mode() === 'dark');
}
