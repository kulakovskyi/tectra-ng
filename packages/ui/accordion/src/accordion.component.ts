import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  model,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraAccordionTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxAccordionContent } from './accordion-content.component';
import { TxAccordionHeader } from './accordion-header.component';
import { TxAccordionPanel } from './accordion-panel.component';
import { TX_ACCORDION, TxAccordionContext } from './accordion.context';
import { TxAccordionContentTemplate, TxAccordionHeaderTemplate, TxAccordionToggleIconTemplate } from './accordion.templates';
import {
  TxAccordionIcon,
  TxAccordionItem,
  TxAccordionPanelValue,
  TxAccordionPart,
  TxAccordionToggleEvent,
  TxAccordionValue,
} from './accordion.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { ACCORDION_ICON_DEFAULTS } from './accordion.icons';
import { ACCORDION_THEME } from './accordion.theme';

@Component({
  selector: 'tx-accordion',
  imports: [TxAccordionPanel, TxAccordionHeader, TxAccordionContent, TxAccordionContentTemplate, NgTemplateOutlet],
  templateUrl: './accordion.component.html',
  styleUrl: './accordion.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_ACCORDION, useExisting: TxAccordion }],
  host: {
    class: 'tx-accordion',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(ACCORDION_ICON_DEFAULTS)],
})
export class TxAccordion implements TxAccordionContext {
  private readonly accordionTheme = injectTokens(ACCORDION_THEME);

  readonly element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  focusSelectPending = false;

  readonly value = model<TxAccordionValue>(null);
  readonly multiple = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly items = input<TxAccordionItem[] | undefined>(undefined);
  readonly expandIcon = input<TxAccordionIcon | undefined>(undefined);
  readonly collapseIcon = input<TxAccordionIcon | undefined>(undefined);
  readonly selectOnFocus = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraAccordionTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxAccordionPart, TxAccordion> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly opened = output<TxAccordionToggleEvent>();
  readonly closed = output<TxAccordionToggleEvent>();

  protected readonly headerTemplate = contentChild(TxAccordionHeaderTemplate, { descendants: false });
  protected readonly contentTemplate = contentChild(TxAccordionContentTemplate, { descendants: false });
  private readonly toggleIcon = contentChild(TxAccordionToggleIconTemplate, { descendants: false });

  readonly toggleIconTemplate = computed(() => this.toggleIcon()?.template);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('accordion', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-accordion'), ...this.passThrough().root?.style }));

  private readonly activeValues = computed<TxAccordionPanelValue[]>(() => {
    const value = this.value();
    if (value === null || value === undefined) {
      return [];
    }
    return Array.isArray(value) ? value : [value];
  });

  protected itemValue(item: TxAccordionItem, index: number): TxAccordionPanelValue {
    return item.value ?? index;
  }

  isActive(value: TxAccordionPanelValue): boolean {
    return this.activeValues().includes(value);
  }

  toggle(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void {
    if (this.isActive(value)) {
      this.close(value, panel, item);
    } else {
      this.open(value, panel, item);
    }
  }

  open(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void {
    if (this.isActive(value)) {
      return;
    }
    const previous = this.multiple() ? [] : this.activeValues();
    this.value.set(this.multiple() ? [...this.activeValues(), value] : value);
    for (const closedValue of previous) {
      const closedPanel = this.panelElement(closedValue);
      this.closed.emit({ value: closedValue, index: this.indexOf(closedPanel), item: this.itemOf(closedValue) });
    }
    this.opened.emit({ value, index: this.indexOf(panel), item });
  }

  private close(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void {
    this.value.set(this.multiple() ? this.activeValues().filter((active) => active !== value) : null);
    this.closed.emit({ value, index: this.indexOf(panel), item });
  }

  private panels(): HTMLElement[] {
    return Array.from(this.element.children).filter((child): child is HTMLElement => child.classList.contains('tx-accordion-panel'));
  }

  private panelElement(value: TxAccordionPanelValue): HTMLElement | undefined {
    return this.panels().find((panel) => panel.dataset['value'] === String(value));
  }

  private indexOf(panel: HTMLElement | undefined): number {
    return panel ? this.panels().indexOf(panel) : -1;
  }

  private itemOf(value: TxAccordionPanelValue): TxAccordionItem | undefined {
    return this.items()?.find((item, index) => this.itemValue(item, index) === value);
  }
}
