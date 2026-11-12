import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TX_TABS } from './tabs.context';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABS_ICON_DEFAULTS } from './tabs.icons';

@Component({
  selector: 'tx-tab-panels',
  template: '<ng-content />',
  styles: `
    :host {
      display: block;
      min-width: 0;
    }

    :host([data-styled]) {
      padding: var(--tx-tabs-panels-padding);
      background: var(--tx-tabs-panels-background);
      color: var(--tx-tabs-panels-color);
    }

    :host([data-styled][data-variant='line']) {
      padding: var(--tx-tabs-panels-line-padding);
      background: var(--tx-tabs-panels-line-background);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tab-panels',
    '[class]': 'tabs.passThrough().panels?.class',
    '[style]': 'tabs.passThrough().panels?.style',
    '[attr.data-styled]': '!tabs.isUnstyled() || null',
    '[attr.data-variant]': 'tabs.variant()',
  },
  viewProviders: [provideTxIconDefaults(TABS_ICON_DEFAULTS)],
})
export class TxTabPanels {
  protected readonly tabs = inject(TX_TABS);
}
