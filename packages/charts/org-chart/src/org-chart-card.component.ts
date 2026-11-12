import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxOrgChartNode } from './org-chart.types';
import { ORG_CHART_ICON_DEFAULTS } from './org-chart.icons';

@Component({
  selector: 'tx-org-chart-card',
  imports: [TxAvatar, TxButton, TxIcon, TxPill, TxTooltip],
  templateUrl: './org-chart-card.component.html',
  styleUrl: './org-chart-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart-card',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(ORG_CHART_ICON_DEFAULTS)],
})
export class TxOrgChartCard {
  private readonly translations = injectTranslations();

  readonly node = input.required<TxOrgChartNode>();
  readonly highlighted = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly inPath = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly expandLabel = input<string | undefined>(undefined);
  readonly collapseLabel = input<string | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly toggleNode = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly toggleLabel = computed(() =>
    this.node().expanded ? (this.collapseLabel() ?? this.translations().orgChartCollapse) : (this.expandLabel() ?? this.translations().orgChartExpand),
  );

  onToggle(event: Event): void {
    event.stopPropagation();
    this.toggleNode.emit();
  }
}
