import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraBadgeTokens, TectraDeepPartial, toStyleObject } from '@tectra/themes';
import { TxBadgePart, TxBadgeSeverity, TxBadgeSize } from './badge.types';

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
})
export class TxBadge {
  value = input<string | number | undefined>(undefined);
  severity = input<TxBadgeSeverity>('primary');
  size = input<TxBadgeSize>('medium');
  dt = input<TectraDeepPartial<TectraBadgeTokens> | undefined>(undefined);
  pt = input<TxPassThrough<TxBadgePart, TxBadge> | undefined>(undefined);
  ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  isUnstyled = injectUnstyled(this.unstyled);
  passThrough = injectPassThrough('badge', this, this.pt, this.ptOptions);
  isDot = computed(() => this.value() === undefined || this.value() === '');
  hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-badge'), ...this.passThrough().root?.style }));
}
