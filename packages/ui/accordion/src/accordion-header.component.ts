import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TxIcon, TxIconRegistry } from '@tectra-ng/icons';
import { TX_ACCORDION, TX_ACCORDION_PANEL } from './accordion.context';

@Component({
  selector: 'tx-accordion-header',
  imports: [TxIcon, NgTemplateOutlet],
  template: `
    <button
      type="button"
      class="tx-accordion-header__button"
      [id]="panel.headerId"
      [disabled]="panel.disabled()"
      [attr.aria-expanded]="panel.active()"
      [attr.aria-controls]="panel.contentId"
      [class]="accordion.passThrough().header?.class"
      [style]="accordion.passThrough().header?.style"
      (click)="panel.toggle()"
      (keydown)="onKeydown($event)"
      (focus)="onFocus()"
    >
      <span class="tx-accordion-header__content" [class]="accordion.passThrough().headerContent?.class" [style]="accordion.passThrough().headerContent?.style"
        ><ng-content
      /></span>
      <span
        class="tx-accordion-header__toggle"
        aria-hidden="true"
        [class.tx-accordion-header__toggle--fixed]="hasCustomIcon()"
        [class]="accordion.passThrough().toggleIcon?.class"
        [style]="accordion.passThrough().toggleIcon?.style"
      >
        @if (accordion.toggleIconTemplate(); as template) {
          <ng-container *ngTemplateOutlet="template; context: { $implicit: panel.active(), active: panel.active() }" />
        } @else if (icon(); as icon) {
          @if (iconName(); as name) {
            <tx-icon [name]="name" />
          } @else {
            <span [class]="icon"></span>
          }
        }
      </span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-accordion-header',
    '[attr.role]': 'headingLevel() ? "heading" : null',
    '[attr.aria-level]': 'headingLevel() ?? null',
  },
})
export class TxAccordionHeader {
  protected readonly accordion = inject(TX_ACCORDION);
  protected readonly panel = inject(TX_ACCORDION_PANEL);
  private txIconRegistry = inject(TxIconRegistry);

  readonly headingLevel = input<number | undefined>(undefined);

  protected readonly hasCustomIcon = computed(() => !!this.accordion.toggleIconTemplate() || !!this.accordion.expandIcon() || !!this.accordion.collapseIcon());
  protected readonly icon = computed(() => {
    const expand = this.accordion.expandIcon();
    const collapse = this.accordion.collapseIcon();
    if (!expand && !collapse) {
      return 'chevron-down';
    }
    return this.panel.active() ? (collapse ?? expand) : (expand ?? collapse);
  });
  protected readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });

  protected onKeydown(event: KeyboardEvent): void {
    const buttons = this.buttons();
    const current = buttons.indexOf(event.currentTarget as HTMLButtonElement);
    let target: HTMLButtonElement | undefined;
    switch (event.key) {
      case 'ArrowDown':
        target = buttons[(current + 1) % buttons.length];
        break;
      case 'ArrowUp':
        target = buttons[(current - 1 + buttons.length) % buttons.length];
        break;
      case 'Home':
        target = buttons[0];
        break;
      case 'End':
        target = buttons[buttons.length - 1];
        break;
      default:
        return;
    }
    event.preventDefault();
    this.accordion.focusSelectPending = this.accordion.selectOnFocus();
    target?.focus();
    this.accordion.focusSelectPending = false;
  }

  protected onFocus(): void {
    if (this.accordion.focusSelectPending) {
      this.accordion.focusSelectPending = false;
      this.panel.open();
    }
  }

  private buttons(): HTMLButtonElement[] {
    const host = this.accordion.element;
    return Array.from(host.querySelectorAll<HTMLButtonElement>('.tx-accordion-header__button')).filter(
      (button) => !button.disabled && button.closest('.tx-accordion') === host,
    );
  }
}
