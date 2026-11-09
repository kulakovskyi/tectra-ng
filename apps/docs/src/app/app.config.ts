import { ApplicationConfig, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideRouter, Router, TitleStrategy, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideTxBrandIcons } from '@tectra-ng/brand-icons';
import { loadTxFlag } from '@tectra-ng/flags';
import { provideTxFlags, txFlagImages } from '@tectra-ng/ui/country';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { routes } from './app.routes';
import { skipViewTransitionsWhileHidden } from './hidden-view-transitions';
import { scrollToTopOnPageChange, snapshotPath } from './page-scroll';
import { DocsThemeSettings } from './layout/theme-settings';
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
    provideTectra({ preset: Tectra, ripple: true }),
    provideTxBrandIcons(),
    provideTxFlags(txFlagImages(loadTxFlag)),
  ],
};
