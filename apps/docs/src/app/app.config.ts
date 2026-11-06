import { ApplicationConfig, DOCUMENT, inject, provideAppInitializer, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideTxBrandIcons } from '@tectra-ng/brand-icons';
import { provideTectra } from '@tectra-ng/core/config';
import { Tectra } from '@tectra-ng/themes';
import { routes } from './app.routes';
import { skipViewTransitionsWhileHidden } from './hidden-view-transitions';
import { DocsThemeSettings } from './layout/theme-settings';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideAppInitializer(skipViewTransitionsWhileHidden),
    provideAppInitializer(() => inject(DocsThemeSettings).restore()),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          if (inject(Router).navigated) {
            return;
          }
          const root = inject(DOCUMENT).documentElement;
          const done = () => root.classList.remove('docs-first-paint');
          root.classList.add('docs-first-paint');
          transition.finished.then(done, done);
        },
      }),
    ),
    provideTectra({ preset: Tectra, ripple: true }),
    provideTxBrandIcons(),
  ],
};
