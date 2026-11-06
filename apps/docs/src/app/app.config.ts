import { ApplicationConfig, inject, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideTxBrandIcons } from '@tectra/brand-icons';
import { provideTectra } from '@tectra/core/config';
import { InkPreset } from '@tectra/themes';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      withViewTransitions({
        onViewTransitionCreated: ({ transition }) => {
          if (!inject(Router).navigated) {
            transition.skipTransition();
          }
        },
      }),
    ),
    provideTectra({ preset: InkPreset, ripple: true }),
    provideTxBrandIcons(),
  ],
};
