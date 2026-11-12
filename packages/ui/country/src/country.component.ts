import { ChangeDetectionStrategy, Component, booleanAttribute, computed, effect, inject, input, signal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraCountryTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { countryEmoji, countryName, isCountryCode } from './countries';
import { TxCountryPart, TxCountrySize, TxFlag, TxFlagShape } from './country.types';
import { TX_FLAG_RESOLVER } from './flags';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { COUNTRY_ICON_DEFAULTS } from './country.icons';
import { COUNTRY_THEME } from './country.theme';

@Component({
  selector: 'tx-country',
  template: `
    @if (code(); as iso) {
      @if (flag(); as image) {
        @if (image.src) {
          <img class="tx-country__flag tx-country__flag--image" alt="" [src]="image.src" [class]="passThrough().flag?.class" [style]="passThrough().flag?.style" />
        } @else {
          <span class="tx-country__flag" aria-hidden="true" [class]="flagClass(image.class)" [style]="passThrough().flag?.style"></span>
        }
      } @else if (isLoading()) {
        <span class="tx-country__flag tx-country__flag--loading" aria-hidden="true" [class]="passThrough().flag?.class" [style]="passThrough().flag?.style"></span>
      } @else {
        <span class="tx-country__flag tx-country__flag--emoji" aria-hidden="true" [class]="passThrough().flag?.class" [style]="passThrough().flag?.style">{{
          emoji()
        }}</span>
      }
    }
    @if (showName()) {
      <span class="tx-country__name" [class]="passThrough().name?.class" [style]="passThrough().name?.style">{{ label() }}</span>
    }
  `,
  styleUrl: './country.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-country',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[attr.data-shape]': 'shape()',
    '[attr.role]': 'showName() || !code() ? null : "img"',
    '[attr.aria-label]': 'showName() || !code() ? null : label()',
    '[attr.title]': 'showName() ? null : label()',
  },
  viewProviders: [provideTxIconDefaults(COUNTRY_ICON_DEFAULTS)],
})
export class TxCountry {
  private readonly countryTheme = injectTokens(COUNTRY_THEME);

  private locale = inject(TxLocaleService);
  private resolver = inject(TX_FLAG_RESOLVER, { optional: true });

  readonly country = input<string | null | undefined>(undefined);
  readonly name = input<string | undefined>(undefined);
  readonly showName = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly size = input<TxCountrySize>('small');
  readonly shape = input<TxFlagShape>('rectangle');
  readonly dt = input<TectraDeepPartial<TectraCountryTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCountryPart, TxCountry> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('country', this, this.pt, this.ptOptions);
  readonly code = computed(() => {
    const value = (this.country() ?? '').trim().toUpperCase();
    return isCountryCode(value) ? value : null;
  });
  readonly label = computed(() => this.name() ?? (this.code() ? countryName(this.code() ?? '', this.locale.locale().intl) : (this.country() ?? '').trim()));
  private readonly loaded = signal<{ key: string; flag: TxFlag | null } | null>(null);
  private readonly resolution = computed(() => {
    const code = this.code();
    return code && this.resolver ? { key: `${this.shape()}:${code}`, value: this.resolver(code, this.shape()) } : null;
  });
  readonly isLoading = computed(() => {
    const resolution = this.resolution();
    return !!resolution && isPromise(resolution.value) && this.loaded()?.key !== resolution.key;
  });
  readonly flag = computed(() => {
    const resolution = this.resolution();
    if (!resolution) {
      return null;
    }
    if (!isPromise(resolution.value)) {
      return resolution.value;
    }
    const loaded = this.loaded();
    return loaded?.key === resolution.key ? loaded.flag : null;
  });
  readonly emoji = computed(() => countryEmoji(this.code() ?? ''));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-country'), ...this.passThrough().root?.style }));

  constructor() {
    effect(() => {
      const resolution = this.resolution();
      if (resolution && isPromise(resolution.value)) {
        const { key, value } = resolution;
        value.then(
          (flag) => this.loaded.set({ key, flag }),
          () => this.loaded.set({ key, flag: null }),
        );
      }
    });
  }

  flagClass(own: string | undefined): string {
    return [own, this.passThrough().flag?.class].filter(Boolean).join(' ');
  }
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return typeof (value as Promise<T> | null)?.then === 'function';
}
