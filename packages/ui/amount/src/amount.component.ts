import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxLocaleService } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraAmountTokens, TectraDeepPartial, toStyleObject } from '@tectra/themes';
import { TxAmountCurrencyDisplay, TxAmountNotation, TxAmountPart, TxAmountSign } from './amount.types';
import { formatAmount } from './format-amount';

@Component({
  selector: 'tx-amount',
  template: `
    @if (isEmpty()) {
      <span class="tx-amount__empty">{{ emptyText() }}</span>
    } @else {
      @for (segment of segments(); track $index) {
        @if (segment.currency) {
          <span class="tx-amount__currency" [class]="passThrough().currency?.class" [style]="passThrough().currency?.style">{{ segment.text }}</span>
        } @else {
          <span class="tx-amount__value" [class]="passThrough().value?.class" [style]="passThrough().value?.style">{{ segment.text }}</span>
        }
      }
    }
  `,
  styleUrl: './amount.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-amount',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-sign]': 'signColor() ? sign() : null',
    '[class.tx-amount--strong]': 'strong()',
    '[class.tx-amount--zero]': 'sign() === "zero"',
    '[class.tx-amount--empty]': 'isEmpty()',
  },
})
export class TxAmount {
  private localeService = inject(TxLocaleService);

  readonly amount = input<number | null | undefined>(null);
  readonly currency = input<string | null | undefined>(undefined);
  readonly format = input<string>('1.0-2');
  readonly notation = input<TxAmountNotation>('standard');
  readonly currencyDisplay = input<TxAmountCurrencyDisplay>('narrowSymbol');
  readonly showSign = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly signColor = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly strong = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly locale = input<string | undefined>(undefined);
  readonly emptyText = input<string>('—');
  readonly dt = input<TectraDeepPartial<TectraAmountTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAmountPart, TxAmount> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('amount', this, this.pt, this.ptOptions);
  readonly isEmpty = computed(() => {
    const amount = this.amount();
    return amount === null || amount === undefined || Number.isNaN(amount);
  });
  readonly sign = computed<TxAmountSign | null>(() => {
    const amount = this.amount();
    if (this.isEmpty() || amount === null || amount === undefined) {
      return null;
    }
    return amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'zero';
  });
  readonly segments = computed(() => {
    const amount = this.amount();
    if (this.isEmpty() || amount === null || amount === undefined) {
      return [];
    }
    return formatAmount(amount, {
      locale: this.locale() ?? this.localeService.locale().intl,
      currency: this.currency(),
      format: this.format(),
      notation: this.notation(),
      currencyDisplay: this.currencyDisplay(),
      showSign: this.showSign(),
    });
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-amount'), ...this.passThrough().root?.style }));
}
