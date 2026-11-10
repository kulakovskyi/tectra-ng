import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { TxChartValueFormat, chartNumberFormatter } from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { segmentedBarSegments } from './segmented-bar-segments';
import { TxSegmentedBarItem, TxSegmentedBarPart, TxSegmentedBarSize } from './segmented-bar.types';

@Component({
  selector: 'tx-segmented-bar',
  templateUrl: './segmented-bar.component.html',
  styleUrl: './segmented-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-segmented-bar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-segmented-bar--mono]': 'monoLabels()',
  },
})
export class TxSegmentedBar {
  private locale = inject(TxLocaleService);

  readonly items = input<readonly TxSegmentedBarItem[] | null | undefined>([]);
  readonly size = input<TxSegmentedBarSize>('small');
  readonly showLegend = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showValue = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showPercent = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly hideEmptyInLegend = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly monoLabels = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSegmentedBarPart, TxSegmentedBar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('segmentedBar', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chart'), ...this.passThrough().root?.style }));

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly segments = computed(() =>
    segmentedBarSegments(this.items(), chartNumberFormatter(this.intl(), this.valueFormat()), chartNumberFormatter(this.intl())),
  );
  readonly barSegments = computed(() => this.segments().filter((segment) => !segment.isEmpty));
  readonly legendSegments = computed(() => (this.hideEmptyInLegend() ? this.barSegments() : this.segments()));
  readonly summary = computed(() => {
    const parts = this.segments().map((segment) => `${segment.label}: ${segment.value} (${segment.percent})`);
    return [this.ariaLabel(), ...parts].filter(Boolean).join(', ');
  });
}
