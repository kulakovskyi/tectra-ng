import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraEmailSuggestionTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxEmailSuggestionPart, TxEmailSuggestionResult } from './email-suggestion.types';
import { TX_COMMON_EMAIL_DOMAINS, suggestEmail } from './suggest-email';
import { EMAIL_SUGGESTION_ICON_DEFAULTS } from './email-suggestion.icons';

@Component({
  selector: 'tx-email-suggestion',
  imports: [TxButton],
  template: `
    @if (suggestion(); as found) {
      <button
        txButton
        type="button"
        class="tx-email-suggestion__button"
        [text]="true"
        [size]="'small'"
        [icon]="icon()"
        [unstyled]="isUnstyled()"
        [class]="passThrough().button?.class"
        [style]="passThrough().button?.style"
        (click)="applied.emit(found.email)"
      >
        {{ text(found) }}
      </button>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-email-suggestion',
    role: 'status',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-kind]': 'suggestion()?.kind ?? null',
  },
  styles: `
    :host {
      display: block;
      min-height: 0;
    }

    :host([data-styled]) .tx-email-suggestion__button {
      margin-top: var(--tx-email-suggestion-offset);
      animation: tx-email-suggestion-in var(--tx-email-suggestion-enter-duration) cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @keyframes tx-email-suggestion-in {
      from {
        opacity: 0;
        transform: translateY(var(--tx-email-suggestion-enter-distance));
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host([data-styled]) .tx-email-suggestion__button {
        animation: none;
      }
    }
  `,
  viewProviders: [provideTxIconDefaults(EMAIL_SUGGESTION_ICON_DEFAULTS)],
})
export class TxEmailSuggestion {
  readonly value = input<string | null | undefined>('');
  readonly domain = input<string | readonly string[]>([]);
  readonly knownDomains = input<readonly string[]>(TX_COMMON_EMAIL_DOMAINS);
  readonly icon = input<TxIconName>('sparkles');
  readonly dt = input<TectraDeepPartial<TectraEmailSuggestionTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxEmailSuggestionPart, TxEmailSuggestion> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly applied = output<string>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('emailSuggestion', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-email-suggestion'), ...this.passThrough().root?.style }));
  readonly suggestion = computed(() => {
    const domain = this.domain();
    return suggestEmail(this.value(), typeof domain === 'string' ? [domain] : domain, this.knownDomains());
  });

  text(found: TxEmailSuggestionResult): string {
    return (found.kind === 'typo' ? this.translations().didYouMean : this.translations().useEmail).replace('{email}', found.email);
  }
}
