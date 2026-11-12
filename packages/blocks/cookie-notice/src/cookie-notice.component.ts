import { ChangeDetectionStrategy, Component, DOCUMENT, afterNextRender, computed, inject, input, numberAttribute, output, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraCookieNoticeTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCookieNoticePart } from './cookie-notice.types';
import { COOKIE_NOTICE_ICON_DEFAULTS } from './cookie-notice.icons';
import { COOKIE_NOTICE_THEME } from './cookie-notice.theme';

const DAY_SECONDS = 86400;

@Component({
  selector: 'tx-cookie-notice',
  imports: [RouterLink, TxButton, TxIcon],
  templateUrl: './cookie-notice.component.html',
  styleUrl: './cookie-notice.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-cookie-notice',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(COOKIE_NOTICE_ICON_DEFAULTS)],
})
export class TxCookieNotice {
  private readonly cookieNoticeTheme = injectTokens(COOKIE_NOTICE_THEME);

  private readonly document = inject(DOCUMENT);
  protected readonly router = inject(ActivatedRoute, { optional: true }) ? inject(Router) : null;

  readonly title = input<string | undefined>(undefined);
  readonly text = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {})>('shield');
  readonly link = input<string | readonly unknown[] | undefined>(undefined);
  readonly href = input<string | undefined>(undefined);
  readonly linkLabel = input<string | undefined>(undefined);
  readonly acceptLabel = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly cookieName = input<string>('cookieNoticeDismissed');
  readonly maxAgeDays = input<number, unknown>(365, { transform: numberAttribute });
  readonly sharedDomain = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraCookieNoticeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCookieNoticePart, TxCookieNotice> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly dismissed = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('cookieNotice', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-cookie-notice'), ...this.passThrough().root?.style }));

  readonly visible = signal(false);

  constructor() {
    afterNextRender(() => this.visible.set(!this.readDismissed()));
  }

  show(): void {
    this.visible.set(true);
  }

  dismiss(): void {
    this.writeDismissed();
    this.visible.set(false);
    this.dismissed.emit();
  }

  private readDismissed(): boolean {
    const name = `${encodeURIComponent(this.cookieName())}=`;
    return this.document.cookie.split('; ').some((entry) => entry === `${name}1`);
  }

  private writeDismissed(): void {
    const location = this.document.location;
    const shared = this.sharedDomain();
    const domain = shared && location?.hostname.endsWith(`.${shared}`) ? `; domain=.${shared}` : '';
    const secure = location?.protocol === 'https:' ? '; secure' : '';
    const maxAge = Math.round(this.maxAgeDays() * DAY_SECONDS);
    this.document.cookie = `${encodeURIComponent(this.cookieName())}=1; max-age=${maxAge}; path=/${domain}${secure}; samesite=lax`;
  }
}
