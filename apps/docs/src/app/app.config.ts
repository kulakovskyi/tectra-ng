import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideTxBrandIcons } from '@tectra-ng/brand-icons';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';
import { loadTxFlag } from '@tectra-ng/flags';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { routes } from './app.routes';
import { skipViewTransitionsWhileHidden } from './hidden-view-transitions';
import { scrollToTopOnPageChange, snapshotPath } from './page-scroll';
import { DOCS_THEME_STORAGE_KEY, DOCS_THEME_STYLES, DocsThemeSettings } from './layout/theme-settings';
import { DocsSeo } from './seo/docs-seo';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideClientHydration(withEventReplay()),
    provideAppInitializer(skipViewTransitionsWhileHidden),
    provideAppInitializer(scrollToTopOnPageChange),
    provideAppInitializer(() => inject(DocsThemeSettings).restore()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'disabled', anchorScrolling: 'enabled' }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition, from, to }) => {
          if (!inject(Router).navigated || snapshotPath(from) === snapshotPath(to)) {
            transition.skipTransition();
          }
        },
      }),
    ),
    { provide: TitleStrategy, useExisting: DocsSeo },
    provideTectra({ preset: Tectra, ripple: true, storageKey: DOCS_THEME_STORAGE_KEY, styles: DOCS_THEME_STYLES }),
    provideTxIcons(TX_ICONS),
    provideTxBrandIcons(),
    provideTxFlags(txFlagImages(loadTxFlag)),
  ],
};
