import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraAppFooterTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxAppFooterLink, TxAppFooterPart, TxAppFooterVariant } from './app-footer.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { APP_FOOTER_ICON_DEFAULTS } from './app-footer.icons';

@Component({
  selector: 'tx-app-footer',
  imports: [RouterLink],
  template: `
    <footer class="tx-app-footer__root">
      <div class="tx-app-footer__inner" [class]="passThrough().inner?.class" [style]="passThrough().inner?.style">
        <span class="tx-app-footer__copy" [class]="passThrough().copy?.class" [style]="passThrough().copy?.style">© {{ currentYear() }} {{ name() }}</span>
        @if (links().length) {
          <nav class="tx-app-footer__nav" [attr.aria-label]="navLabel() ?? translations().legal" [class]="passThrough().nav?.class" [style]="passThrough().nav?.style">
            @for (item of links(); track item.label) {
              @if (item.routerLink !== undefined) {
                <a class="tx-app-footer__link" [routerLink]="item.routerLink" [queryParams]="item.queryParams" [attr.target]="item.target ?? null" [class]="passThrough().link?.class" [style]="passThrough().link?.style">{{ item.label }}</a>
              } @else {
                <a class="tx-app-footer__link" [attr.href]="item.url ?? null" [attr.target]="item.target ?? null" [class]="passThrough().link?.class" [style]="passThrough().link?.style">{{ item.label }}</a>
              }
            }
          </nav>
        }
      </div>
    </footer>
  `,
  styleUrl: './app-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-app-footer',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
  },
  viewProviders: [provideTxIconDefaults(APP_FOOTER_ICON_DEFAULTS)],
})
export class TxAppFooter {
  readonly name = input.required<string>();
  readonly links = input<readonly TxAppFooterLink[]>([]);
  readonly variant = input<TxAppFooterVariant>('page');
  readonly navLabel = input<string | undefined>(undefined);
  readonly year = input<number | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraAppFooterTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAppFooterPart, TxAppFooter> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('appFooter', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly currentYear = computed(() => this.year() ?? new Date().getFullYear());
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-app-footer'), ...this.passThrough().root?.style }));
}
