import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIconName } from '@tectra/icons';
import { TxButton } from '@tectra/ui/button';
import { TxEmailSuggestionPart, TxEmailSuggestionResult } from './email-suggestion.types';
import { TX_COMMON_EMAIL_DOMAINS, suggestEmail } from './suggest-email';

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
    '[style]': 'passThrough().root?.style',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-kind]': 'suggestion()?.kind ?? null',
  },
  styles: `
    :host {
      display: block;
      min-height: 0;
    }
  `,
})
export class TxEmailSuggestion {
  readonly value = input<string | null | undefined>('');
  readonly domain = input<string | readonly string[]>([]);
  readonly knownDomains = input<readonly string[]>(TX_COMMON_EMAIL_DOMAINS);
  readonly icon = input<TxIconName>('sparkles');
  readonly pt = input<TxPassThrough<TxEmailSuggestionPart, TxEmailSuggestion> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly applied = output<string>();

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('emailSuggestion', this, this.pt, this.ptOptions);
  readonly suggestion = computed(() => {
    const domain = this.domain();
    return suggestEmail(this.value(), typeof domain === 'string' ? [domain] : domain, this.knownDomains());
  });

  text(found: TxEmailSuggestionResult): string {
    return (found.kind === 'typo' ? this.translations().didYouMean : this.translations().useEmail).replace('{email}', found.email);
  }
}
