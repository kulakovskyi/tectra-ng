import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraCardTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxCardPart } from './card.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CARD_ICON_DEFAULTS } from './card.icons';
import { CARD_THEME } from './card.theme';

@Component({
  selector: 'tx-card',
  template: `
    <div class="tx-card__header" [class]="passThrough().header?.class" [style]="passThrough().header?.style"><ng-content select="[txCardHeader]" /></div>
    <div class="tx-card__body" [class]="passThrough().body?.class" [style]="passThrough().body?.style">
      @if (title()) {
        <div class="tx-card__title" role="heading" [attr.aria-level]="headingLevel()" [class]="passThrough().title?.class" [style]="passThrough().title?.style">{{ title() }}</div>
      }
      <ng-content select="[txCardTitle]" />
      @if (subtitle()) {
        <div class="tx-card__subtitle" [class]="passThrough().subtitle?.class" [style]="passThrough().subtitle?.style">{{ subtitle() }}</div>
      }
      <div class="tx-card__content" [class]="passThrough().content?.class" [style]="passThrough().content?.style"><ng-content /></div>
      <div class="tx-card__footer" [class]="passThrough().footer?.class" [style]="passThrough().footer?.style"><ng-content select="[txCardFooter]" /></div>
    </div>
  `,
  styleUrl: './card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-card',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.title]': 'null',
  },
  viewProviders: [provideTxIconDefaults(CARD_ICON_DEFAULTS)],
})
export class TxCard {
  private readonly cardTheme = injectTokens(CARD_THEME);

  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly headingLevel = input<number>(3);
  readonly dt = input<TectraDeepPartial<TectraCardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxCardPart, TxCard> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('card', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-card'), ...this.passThrough().root?.style }));
}
