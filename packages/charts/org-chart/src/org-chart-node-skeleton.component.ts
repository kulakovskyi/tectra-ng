import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectTokens, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { ORG_CHART_ICON_DEFAULTS } from './org-chart.icons';
import { ORG_CHART_THEME } from './org-chart.theme';

/** Placeholder card shown in place of the children of a node while they load. */
@Component({
  selector: 'tx-org-chart-node-skeleton',
  imports: [TxSkeleton],
  template: `
    <div class="tx-org-chart-node-skeleton__box" aria-hidden="true">
      <tx-skeleton shape="circle" size="var(--tx-chart-org-chart-avatar-size)" />
      <div class="tx-org-chart-node-skeleton__lines">
        <tx-skeleton width="98px" height="10.5px" borderRadius="999px" />
        <tx-skeleton width="70px" height="8.75px" borderRadius="999px" />
      </div>
    </div>
  `,
  styles: `
    .tx-org-chart-node-skeleton__box {
      display: flex;
      align-items: center;
    }
    .tx-org-chart-node-skeleton__lines {
      display: flex;
      flex: 1;
      flex-direction: column;
    }
    :host([data-styled]) .tx-org-chart-node-skeleton__box {
      gap: var(--tx-chart-org-chart-card-gap);
      box-sizing: border-box;
      width: var(--tx-chart-org-chart-card-width);
      padding: var(--tx-chart-org-chart-card-padding-y);
      border-radius: var(--tx-chart-org-chart-card-radius);
      background: var(--tx-chart-org-chart-card-background);
      box-shadow: 0 0 0 1px var(--tx-chart-org-chart-card-border-color);
    }
    :host([data-styled]) .tx-org-chart-node-skeleton__lines {
      gap: var(--tx-chart-org-chart-toolbar-gap);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart-node-skeleton',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(ORG_CHART_ICON_DEFAULTS)],
})
export class TxOrgChartNodeSkeleton {
  private readonly orgChartTheme = injectTokens(ORG_CHART_THEME);

  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly isUnstyled = injectUnstyled(this.unstyled);
}
