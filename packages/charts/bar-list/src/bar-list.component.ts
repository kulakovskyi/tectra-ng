import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TxChartValueFormat, chartNumberFormatter } from '@tectra-ng/charts/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraChartTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { barListRows } from './bar-list-rows';
import { TxBarListItem, TxBarListPart } from './bar-list.types';

const SKELETON_ROWS = 5;

@Component({
  selector: 'tx-bar-list',
  imports: [NgTemplateOutlet, RouterLink, TxSkeleton],
  templateUrl: './bar-list.component.html',
  styleUrl: './bar-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-bar-list',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-busy]': 'loading() || null',
  },
})
export class TxBarList {
  private locale = inject(TxLocaleService);
  readonly translations = injectTranslations();

  readonly items = input<readonly TxBarListItem[] | null | undefined>([]);
  readonly limit = input(10);
  readonly valueFormat = input<TxChartValueFormat>('number');
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input('');
  readonly dt = input<TectraDeepPartial<TectraChartTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxBarListPart, TxBarList> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('barList', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-chart'), ...this.passThrough().root?.style }));

  private readonly intl = computed(() => this.locale.locale().intl);
  readonly rows = computed(() =>
    barListRows(this.items(), this.limit(), chartNumberFormatter(this.intl(), this.valueFormat()), chartNumberFormatter(this.intl())),
  );
  readonly skeletonRows = computed(() => Array.from({ length: Math.min(SKELETON_ROWS, Math.max(1, this.limit())) }, (_, index) => index));
}
