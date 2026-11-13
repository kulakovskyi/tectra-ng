import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSparklineTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSparklinePart, TxSparklinePoint, TxSparklineTone } from './sparkline.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SPARKLINE_ICON_DEFAULTS } from './sparkline.icons';
import { SPARKLINE_THEME } from './sparkline.theme';

const WIDTH = 120;
const HEIGHT = 36;
const PADDING = 3;

/**
 * Scales values between their smallest and largest into drawing points; fewer than two finite numbers
 * give no points.
 */
export function sparklinePoints(values: readonly number[]): TxSparklinePoint[] {
  const numbers = values.filter((value) => Number.isFinite(value));
  if (numbers.length < 2) {
    return [];
  }
  const min = Math.min(...numbers);
  const range = Math.max(...numbers) - min || 1;
  const step = WIDTH / (numbers.length - 1);
  const usable = HEIGHT - PADDING * 2;
  return numbers.map((value, index) => ({ x: index * step, y: PADDING + usable - ((value - min) / range) * usable }));
}

@Component({
  selector: 'tx-sparkline',
  template: `
    @if (line(); as path) {
      <svg
        class="tx-sparkline__svg"
        preserveAspectRatio="none"
        focusable="false"
        aria-hidden="true"
        [attr.viewBox]="viewBox"
        [class]="passThrough().svg?.class"
        [style]="passThrough().svg?.style"
      >
        <path class="tx-sparkline__area" [attr.d]="area()" [class]="passThrough().area?.class" [style]="passThrough().area?.style" />
        <path class="tx-sparkline__line" [attr.d]="path" [class]="passThrough().line?.class" [style]="passThrough().line?.style" />
      </svg>
    }
  `,
  styleUrl: './sparkline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-sparkline',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-tone]': 'tone()',
    '[attr.role]': 'ariaLabel() ? "img" : null',
    '[attr.aria-label]': 'ariaLabel() || null',
    '[attr.aria-hidden]': 'ariaLabel() ? null : "true"',
  },
  viewProviders: [provideTxIconDefaults(SPARKLINE_ICON_DEFAULTS)],
})
export class TxSparkline {
  private readonly sparklineTheme = injectTokens(SPARKLINE_THEME);

  readonly values = input<readonly number[] | null | undefined>([]);
  readonly tone = input<TxSparklineTone>('primary');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSparklineTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSparklinePart, TxSparkline> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('sparkline', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-sparkline'), ...this.passThrough().root?.style }));

  protected readonly viewBox = `0 0 ${WIDTH} ${HEIGHT}`;
  readonly points = computed(() => sparklinePoints(this.values() ?? []));
  readonly line = computed(() =>
    this.points()
      .map((point, index) => `${index ? 'L' : 'M'}${point.x},${point.y}`)
      .join(' '),
  );
  readonly area = computed(() => (this.line() ? `${this.line()} L${WIDTH},${HEIGHT} L0,${HEIGHT} Z` : ''));
}
