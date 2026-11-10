import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { formatMessage } from '@tectra-ng/core/i18n';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxOrgChartLabels, TxOrgChartToolbarState } from './org-chart.types';

const SEARCH_DELAY = 400;

@Component({
  selector: 'tx-org-chart-toolbar',
  imports: [TxButton, TxIconField, TxInputIcon, TxInput, TxPill, TxTooltip],
  templateUrl: './org-chart-toolbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-org-chart-toolbar',
    'data-drag-ignore': '',
  },
})
export class TxOrgChartToolbar {
  readonly state = input.required<TxOrgChartToolbarState>();
  readonly labels = input.required<TxOrgChartLabels>();
  readonly intl = input('en-US');
  readonly query = input('');

  readonly searchChange = output<string>();
  readonly zoomIn = output<void>();
  readonly zoomOut = output<void>();
  readonly resetZoom = output<void>();
  readonly fit = output<void>();
  readonly expandAll = output<void>();
  readonly collapseAll = output<void>();
  readonly fullscreen = output<void>();

  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  matches(count: number): string {
    return formatMessage(this.labels().matches, { count }, this.intl());
  }

  onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.searchChange.emit(value), SEARCH_DELAY);
  }
}
