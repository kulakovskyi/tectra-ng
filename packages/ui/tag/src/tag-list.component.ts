import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTagTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPopover, TxPopoverContent, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTag } from './tag.component';
import { TxTagListItem, TxTagListPart, TxTagSeverity, TxTagSize } from './tag.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TAG_ICON_DEFAULTS } from './tag.icons';

@Component({
  selector: 'tx-tag-list',
  imports: [NgTemplateOutlet, TxTag, TxTooltip, TxPopover, TxPopoverContent, TxPopoverTrigger],
  templateUrl: './tag-list.component.html',
  styleUrl: './tag-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tag-list',
    role: 'list',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[class.tx-tag-list--empty]': '!all().length',
  },
  viewProviders: [provideTxIconDefaults(TAG_ICON_DEFAULTS)],
})
export class TxTagList {
  readonly tags = input<readonly TxTagListItem[] | null | undefined>([]);
  readonly limit = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly severity = input<TxTagSeverity>('secondary');
  readonly size = input<TxTagSize>('medium');
  readonly rounded = input(false, { transform: booleanAttribute });
  readonly emptyText = input('-');
  readonly moreLabel = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraTagTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTagListPart, TxTagList> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('tagList', this, this.pt, this.ptOptions);
  protected readonly t = injectTranslations();

  protected readonly all = computed(() => this.tags() ?? []);
  protected readonly visible = computed(() => {
    const limit = this.limit();
    return limit && limit > 0 ? this.all().slice(0, limit) : this.all();
  });
  protected readonly hidden = computed(() => {
    const limit = this.limit();
    return limit && limit > 0 ? this.all().slice(limit) : [];
  });
  protected readonly moreText = computed(() => this.moreLabel() ?? this.t().moreItems.replace('{count}', String(this.hidden().length)));

  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-tag'), ...this.passThrough().root?.style }));
}
