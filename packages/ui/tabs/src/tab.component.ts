import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnInit, booleanAttribute, computed, inject, input } from '@angular/core';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TX_TABS } from './tabs.context';
import { TxTabValue } from './tabs.types';
import { TABS_ICON_DEFAULTS } from './tabs.icons';

@Component({
  selector: 'tx-tab, a[txTab], button[txTab]',
  imports: [TxIcon],
  template: `
    @if (icon(); as icon) {
      <span class="tx-tab__icon" aria-hidden="true" [class]="tabs.passThrough().icon?.class" [style]="tabs.passThrough().icon?.style">
        @if (iconName(); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon"></span>
        }
      </span>
    }
    <span class="tx-tab__label" [class]="tabs.passThrough().label?.class" [style]="tabs.passThrough().label?.style"><ng-content /></span>
    @if (hasBadge()) {
      <span class="tx-tab__badge" [class]="tabs.passThrough().badge?.class" [style]="tabs.passThrough().badge?.style"><span class="tx-tab__badge-value">{{ badge() }}</span></span>
    }
  `,
  styleUrl: './tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tab',
    role: 'tab',
    '[class]': 'tabs.passThrough().tab?.class',
    '[style]': 'tabs.passThrough().tab?.style',
    '[attr.data-styled]': '!tabs.isUnstyled() || null',
    '[attr.data-variant]': 'tabs.variant()',
    '[attr.data-size]': 'tabs.size()',
    '[attr.data-orientation]': 'tabs.orientation()',
    '[class.tx-tab--raised]': 'tabs.raised()',
    '[class.tx-tab--active]': 'active()',
    '[class.tx-tab--disabled]': 'disabled()',
    '[id]': 'tabs.tabId(value())',
    '[attr.type]': 'isButton ? "button" : null',
    '[attr.tabindex]': 'tabs.focusValue() === value() ? 0 : -1',
    '[attr.aria-selected]': 'active()',
    '[attr.aria-disabled]': 'disabled() || null',
    '[attr.aria-controls]': 'tabs.hasPanel(value()) ? tabs.panelId(value()) : null',
    '[attr.data-value]': 'value()',
    '(click)': 'onClick($event)',
  },
  viewProviders: [provideTxIconDefaults(TABS_ICON_DEFAULTS)],
})
export class TxTab implements OnInit {
  protected readonly tabs = inject(TX_TABS);
  private txIconRegistry = injectTxIcons();
  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  protected readonly isButton = this.element.tagName === 'BUTTON';

  readonly value = input.required<TxTabValue>();
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly badge = input<number | string | null | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly active = computed(() => this.tabs.value() === this.value());
  readonly hasBadge = computed(() => this.badge() !== undefined && this.badge() !== null && this.badge() !== '');
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });

  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    const unregister = this.tabs.registerTab({ value: this.value, description: this.description, disabled: this.disabled });
    this.destroyRef.onDestroy(unregister);
  }

  focus(): void {
    this.element.focus();
  }

  protected onClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    this.tabs.select(this.value());
  }
}
