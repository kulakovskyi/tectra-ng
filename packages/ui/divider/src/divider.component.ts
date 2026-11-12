import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraDividerTokens, toStyleObject } from '@tectra-ng/themes';
import { TxDividerAlign, TxDividerLayout, TxDividerPart, TxDividerType } from './divider.types';
import { DIVIDER_THEME } from './divider.theme';

@Component({
  selector: 'tx-divider',
  template: `<span class="tx-divider__content" [class]="passThrough().content?.class" [style]="passThrough().content?.style"><ng-content /></span>`,
  styleUrl: './divider.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-divider',
    role: 'separator',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
    '[attr.data-type]': 'type()',
    '[attr.data-align]': 'align()',
    '[attr.aria-orientation]': 'layout()',
  },
})
export class TxDivider {
  private readonly dividerTheme = injectTokens(DIVIDER_THEME);

  readonly layout = input<TxDividerLayout>('horizontal');
  readonly type = input<TxDividerType>('solid');
  readonly align = input<TxDividerAlign>('center');
  readonly dt = input<TectraDeepPartial<TectraDividerTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxDividerPart, TxDivider> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('divider', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-divider'), ...this.passThrough().root?.style }));
}
