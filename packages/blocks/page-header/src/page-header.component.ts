import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraPageHeaderTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPageHeaderLevel, TxPageHeaderPart } from './page-header.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { PAGE_HEADER_ICON_DEFAULTS } from './page-header.icons';
import { PAGE_HEADER_THEME } from './page-header.theme';

@Component({
  selector: 'tx-page-header',
  imports: [NgTemplateOutlet],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-page-header',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(PAGE_HEADER_ICON_DEFAULTS)],
})
export class TxPageHeader {
  private readonly pageHeaderTheme = injectTokens(PAGE_HEADER_THEME);

  readonly title = input.required<string>();
  readonly subtitle = input<string | undefined>(undefined);
  readonly headingLevel = input<TxPageHeaderLevel>(1);
  readonly dt = input<TectraDeepPartial<TectraPageHeaderTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPageHeaderPart, TxPageHeader> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('pageHeader', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-page-header'), ...this.passThrough().root?.style }));
}
