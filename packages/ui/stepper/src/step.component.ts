import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, contentChild, inject, input, viewChild } from '@angular/core';
import { TxStepItem } from './step-item.component';
import { TxStepperRef } from './stepper.context';
import { TxStepContent } from './stepper.templates';
import { TxStepContentContext, TxStepValue } from './stepper.types';

@Component({
  selector: 'tx-step',
  imports: [NgTemplateOutlet],
  templateUrl: './step.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step',
    role: 'presentation',
    '[class]': 'stepper.passThrough().step?.class',
    '[style]': 'stepper.passThrough().step?.style',
    '[class.tx-step--active]': 'active()',
    '[class.tx-step--completed]': 'completed()',
    '[class.tx-step--disabled]': 'disabled()',
  },
})
export class TxStep {
  protected readonly stepper = inject(TxStepperRef);
  private readonly item = inject(TxStepItem, { optional: true });

  readonly value = input<TxStepValue | undefined>(undefined);
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });

  protected readonly contentTemplate = contentChild(TxStepContent);
  private readonly header = viewChild<ElementRef<HTMLButtonElement>>('header');

  readonly inItem = !!this.item;
  readonly resolvedValue = computed(() => this.value() ?? this.item?.value());
  readonly index = computed(() => this.stepper.indexOf(this.resolvedValue()));
  readonly active = computed(() => this.stepper.isActive(this.resolvedValue()));
  readonly completed = computed(() => this.stepper.isCompleted(this.resolvedValue()));
  readonly isDisabled = computed(() => this.disabled() || (this.stepper.linear() && !this.active()));
  readonly showSeparator = computed(() => !this.inItem && !this.stepper.isLast(this.resolvedValue()));
  readonly stepId = computed(() => this.stepper.stepId(this.resolvedValue()));
  readonly panelId = computed(() => (this.stepper.hasPanel(this.resolvedValue()) ? this.stepper.panelId(this.resolvedValue()) : null));
  readonly tabIndex = computed(() => {
    if (this.inItem || this.isDisabled()) {
      return null;
    }
    const focusable = this.active() || (this.stepper.activeIndex() < 0 && this.stepper.firstEnabled() === this.resolvedValue());
    return focusable ? 0 : -1;
  });
  protected readonly context = computed<TxStepContentContext>(() => {
    const value = this.resolvedValue() ?? '';
    return {
      $implicit: value,
      value,
      index: this.index(),
      active: this.active(),
      completed: this.completed(),
      disabled: this.isDisabled(),
      activate: (target: TxStepValue) => this.stepper.activate(target),
    };
  });

  focus(): void {
    this.header()?.nativeElement.focus();
  }

  protected select(): void {
    const value = this.resolvedValue();
    if (!this.isDisabled() && value !== undefined) {
      this.stepper.activate(value);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!this.inItem && this.stepper.focusSibling(this.resolvedValue(), event.key)) {
      event.preventDefault();
    }
  }
}
