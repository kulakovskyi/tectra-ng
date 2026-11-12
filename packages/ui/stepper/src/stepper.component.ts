import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  input,
  model,
} from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraStepperTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStepItem } from './step-item.component';
import { TxStepPanel } from './step-panel.component';
import { TxStep } from './step.component';
import { TxStepperRef } from './stepper.context';
import { TxStepperPart, TxStepValue } from './stepper.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STEPPER_ICON_DEFAULTS } from './stepper.icons';

const NEXT_KEYS = ['ArrowRight', 'ArrowDown'];
const PREVIOUS_KEYS = ['ArrowLeft', 'ArrowUp'];

@Component({
  selector: 'tx-stepper',
  template: '<ng-content />',
  styleUrl: './stepper.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TxStepperRef, useExisting: TxStepper }],
  host: {
    class: 'tx-stepper',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-stepper--vertical]': 'vertical()',
    '[class.tx-stepper--linear]': 'linear()',
  },
  viewProviders: [provideTxIconDefaults(STEPPER_ICON_DEFAULTS)],
})
export class TxStepper extends TxStepperRef {
  private readonly id = uniqueId('tx-stepper');

  readonly value = model<TxStepValue | undefined>(undefined);
  readonly linear = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraStepperTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxStepperPart, TxStepper> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  private readonly steps = contentChildren(TxStep, { descendants: true });
  private readonly items = contentChildren(TxStepItem, { descendants: true });
  private readonly panels = contentChildren(TxStepPanel, { descendants: true });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('stepper', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-stepper'), ...this.passThrough().root?.style }));
  readonly vertical = computed(() => this.items().length > 0);
  private readonly values = computed(() => this.steps().map((step) => step.resolvedValue()));
  private readonly panelValues = computed(() => new Set(this.panels().map((panel) => panel.resolvedValue())));
  readonly activeIndex = computed(() => this.indexOf(this.value()));

  indexOf(value: TxStepValue | undefined): number {
    return value === undefined ? -1 : this.values().indexOf(value);
  }

  isActive(value: TxStepValue | undefined): boolean {
    return value !== undefined && value === this.value();
  }

  isCompleted(value: TxStepValue | undefined): boolean {
    const index = this.indexOf(value);
    return index >= 0 && index < this.activeIndex();
  }

  isLast(value: TxStepValue | undefined): boolean {
    const values = this.values();
    return values.length > 0 && values[values.length - 1] === value;
  }

  hasPanel(value: TxStepValue | undefined): boolean {
    return value !== undefined && this.panelValues().has(value);
  }

  firstEnabled(): TxStepValue | undefined {
    return this.steps().find((step) => !step.isDisabled())?.resolvedValue();
  }

  activate(value: TxStepValue): void {
    this.value.set(value);
  }

  stepId(value: TxStepValue | undefined): string {
    return `${this.id}-step-${this.slug(value)}`;
  }

  panelId(value: TxStepValue | undefined): string {
    return `${this.id}-panel-${this.slug(value)}`;
  }

  focusSibling(from: TxStepValue | undefined, key: string): boolean {
    const enabled = this.steps().filter((step) => !step.inItem && !step.isDisabled());
    if (!enabled.length) {
      return false;
    }
    const current = enabled.findIndex((step) => step.resolvedValue() === from);
    let target: TxStep | undefined;
    if (NEXT_KEYS.includes(key)) {
      target = enabled[(current + 1) % enabled.length];
    } else if (PREVIOUS_KEYS.includes(key)) {
      target = enabled[(current - 1 + enabled.length) % enabled.length];
    } else if (key === 'Home') {
      target = enabled[0];
    } else if (key === 'End') {
      target = enabled[enabled.length - 1];
    }
    target?.focus();
    return !!target;
  }

  private slug(value: TxStepValue | undefined): string {
    return String(value ?? '').replace(/[^\w-]/g, '_');
  }
}
