import {
  ApplicationInitStatus,
  EnvironmentInjector,
  EnvironmentProviders,
  effect,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
  runInInjectionContext,
  untracked,
} from '@angular/core';
import { TxLocaleDefinition } from '@tectra-ng/core/config';
import { TxLocaleService } from './locale.service';

/** Called with the code and the definition of the current locale; runs in an injection context, so it may `inject()`. */
export type TxLocaleListener = (code: string, locale: TxLocaleDefinition) => void;

/**
 * Mirrors the tectra locale into the app: calls the listener once the app has started (with the start locale, a
 * remembered one included) and again after every change, e.g. to switch the app's own translation library.
 */
export function provideTxLocaleSync(listener: TxLocaleListener): EnvironmentProviders {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      const injector = inject(EnvironmentInjector);
      void inject(ApplicationInitStatus).donePromise.then(() => {
        if (injector.destroyed) {
          return;
        }
        const service = injector.get(TxLocaleService);
        effect(
          () => {
            const locale = service.locale();
            untracked(() => runInInjectionContext(injector, () => listener(locale.code, locale)));
          },
          { injector },
        );
      });
    }),
  ]);
}
