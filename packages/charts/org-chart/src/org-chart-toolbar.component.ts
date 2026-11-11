import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, booleanAttribute, inject, input, output, signal } from '@angular/core';
import { formatMessage } from '@tectra-ng/core/i18n';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxOrgChartLabels, TxOrgChartToolbarState } from './org-chart.types';

const SEARCH_DELAY = 400;
const NARROW_REM = 30;

@Component({
  selector: 'tx-org-chart-toolbar',
  imports: [TxButton, TxIconField, TxInputIcon, TxInput, TxPill, TxPopover, TxPopoverTrigger, TxTooltip],
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
  readonly moreLabel = input('');
  readonly unstyled = input<boolean, unknown>(false, { transform: booleanAttribute });

  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private document = inject(DOCUMENT);
  readonly narrow = signal(false);

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

  measure(): void {
    const box = this.host.nativeElement.closest<HTMLElement>('.tx-org-chart__bar, .tx-org-chart__floating') ?? this.host.nativeElement;
    const root = this.document.defaultView?.getComputedStyle(this.document.documentElement);
    const rem = parseFloat(root?.fontSize ?? '') || 16;
    this.narrow.set(box.clientWidth < NARROW_REM * rem);
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
