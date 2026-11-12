import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraBadgeTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxBadgePart, TxBadgeSeverity, TxBadgeSize } from './badge.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { BADGE_ICON_DEFAULTS } from './badge.icons';

@Component({
  selector: 'tx-badge',
  template: '{{ value() }}',
  styleUrl: './badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-badge',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'size()',
    '[class.tx-badge--dot]': 'isDot()',
  },
  viewProviders: [provideTxIconDefaults(BADGE_ICON_DEFAULTS)],
})
export class TxBadge {
  readonly value = input<string | number | undefined>(undefined);
  readonly severity = input<TxBadgeSeverity>('primary');
  readonly size = input<TxBadgeSize>('medium');
  readonly dt = input<TectraDeepPartial<TectraBadgeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxBadgePart, TxBadge> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  isUnstyled = injectUnstyled(this.unstyled);
  passThrough = injectPassThrough('badge', this, this.pt, this.ptOptions);
  readonly isDot = computed(() => this.value() === undefined || this.value() === '');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-badge'), ...this.passThrough().root?.style }));
}
