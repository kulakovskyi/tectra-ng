import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSkeletonTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSkeletonAnimation, TxSkeletonPart, TxSkeletonShape } from './skeleton.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SKELETON_ICON_DEFAULTS } from './skeleton.icons';

@Component({
  selector: 'tx-skeleton',
  template: `
    @if (lineList().length) {
      @for (line of lineList(); track line) {
        <span class="tx-skeleton__line" [class]="passThrough().line?.class" [style]="passThrough().line?.style"></span>
      }
    }
  `,
  styleUrl: './skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-skeleton',
    'aria-hidden': 'true',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-shape]': 'shape()',
    '[attr.data-animation]': 'animation()',
    '[class.tx-skeleton--lines]': 'lineList().length > 0',
  },
  viewProviders: [provideTxIconDefaults(SKELETON_ICON_DEFAULTS)],
})
export class TxSkeleton {
  readonly shape = input<TxSkeletonShape>('rectangle');
  readonly size = input<string | undefined>(undefined);
  readonly width = input<string | undefined>(undefined);
  readonly height = input<string | undefined>(undefined);
  readonly borderRadius = input<string | undefined>(undefined);
  readonly lines = input<number, unknown>(0, { transform: numberAttribute });
  readonly animation = input<TxSkeletonAnimation>('wave');
  readonly dt = input<TectraDeepPartial<TectraSkeletonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSkeletonPart, TxSkeleton> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('skeleton', this, this.pt, this.ptOptions);
  readonly lineList = computed(() => Array.from({ length: Math.max(0, this.lines()) }, (_, index) => index));
  readonly hostStyle = computed(() => {
    const size = this.size();
    return {
      ...toStyleObject(this.dt(), '--tx-skeleton'),
      ...(size || this.width() ? { width: size ?? this.width() } : {}),
      ...(size || this.height() ? { height: size ?? this.height() } : {}),
      ...(this.borderRadius() ? { borderRadius: this.borderRadius() } : {}),
      ...this.passThrough().root?.style,
    };
  });
}
