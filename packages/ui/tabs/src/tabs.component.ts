import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model, output, signal, Signal } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTabsTokens, toStyleObject } from '@tectra-ng/themes';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxTab } from './tab.component';
import { TxTabList } from './tab-list.component';
import { TX_TABS, TxTabRegistration, TxTabsContext } from './tabs.context';
import { TxTabItem, TxTabValue, TxTabsOrientation, TxTabsPart, TxTabsSize, TxTabsVariant } from './tabs.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABS_ICON_DEFAULTS } from './tabs.icons';

@Component({
  selector: 'tx-tabs',
  imports: [TxTabList, TxTab, TxTooltip],
  template: `
    @if (tabs(); as items) {
      <tx-tab-list [ariaLabel]="ariaLabel()" [ariaLabelledBy]="ariaLabelledBy()">
        @for (item of items; track item.value) {
          <tx-tab
            [value]="item.value"
            [icon]="item.icon"
            [badge]="item.badge"
            [description]="item.description"
            [disabled]="item.disabled ?? false"
            [txTooltip]="item.tooltip"
            tooltipPlacement="top"
            >{{ item.label }}</tx-tab
          >
        }
      </tx-tab-list>
    }
    <ng-content />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_TABS, useExisting: TxTabs }],
  host: {
    class: 'tx-tabs',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-size]': 'size()',
    '[attr.data-orientation]': 'orientation()',
    '[class.tx-tabs--raised]': 'raised()',
  },
  viewProviders: [provideTxIconDefaults(TABS_ICON_DEFAULTS)],
})
export class TxTabs implements TxTabsContext {
  private baseId = uniqueId('tx-tabs');
  private readonly tabRegistrations = signal<TxTabRegistration[]>([]);
  private readonly panelValues = signal<Signal<TxTabValue>[]>([]);

  readonly value = model<TxTabValue | undefined>(undefined);
  readonly tabs = input<TxTabItem[] | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly variant = input<TxTabsVariant>('segmented');
  readonly size = input<TxTabsSize>('medium');
  readonly orientation = input<TxTabsOrientation>('horizontal');
  readonly raised = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly scrollable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showNavigators = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly selectOnFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraTabsTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTabsPart, TxTabs> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly tabChange = output<TxTabValue>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('tabs', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-tabs'), ...this.passThrough().root?.style }));
  readonly activeDescription = computed(() => {
    const value = this.value();
    return this.tabRegistrations()
      .find((tab) => tab.value() === value)
      ?.description();
  });

  readonly focusValue = computed(() => {
    const tabs = this.tabRegistrations().filter((tab) => !tab.disabled());
    const value = this.value();
    return (tabs.find((tab) => tab.value() === value) ?? tabs[0])?.value();
  });

  select(value: TxTabValue): void {
    if (this.value() === value) {
      return;
    }
    this.value.set(value);
    this.tabChange.emit(value);
  }

  hasPanel(value: TxTabValue): boolean {
    return this.panelValues().some((panel) => panel() === value);
  }

  tabId(value: TxTabValue): string {
    return `${this.baseId}-tab-${this.idPart(value)}`;
  }

  panelId(value: TxTabValue): string {
    return `${this.baseId}-panel-${this.idPart(value)}`;
  }

  registerTab(tab: TxTabRegistration): () => void {
    this.tabRegistrations.update((tabs) => [...tabs, tab]);
    return () => this.tabRegistrations.update((tabs) => tabs.filter((item) => item !== tab));
  }

  registerPanel(value: Signal<TxTabValue>): () => void {
    this.panelValues.update((panels) => [...panels, value]);
    return () => this.panelValues.update((panels) => panels.filter((item) => item !== value));
  }

  private idPart(value: TxTabValue): string {
    return String(value).replace(/[^\w-]/g, '_');
  }
}
