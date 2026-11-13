import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, inject, input, linkedSignal } from '@angular/core';
import { TxStepItem } from './step-item.component';
import { TxStepperRef } from './stepper.context';
import { TxStepPanelContent } from './stepper.templates';
import { TxStepPanelContext, TxStepValue } from './stepper.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { STEPPER_ICON_DEFAULTS } from './stepper.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { STEPPER_THEME } from './stepper.theme';

/** The content of one step of `tx-stepper`, shown while the step is active. */
@Component({
  selector: 'tx-step-panel',
  imports: [NgTemplateOutlet],
  templateUrl: './step-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-step-panel',
    '[class]': 'stepper.passThrough().panel?.class',
    '[style]': 'stepper.passThrough().panel?.style',
    '[class.tx-step-panel--active]': 'active()',
    '[id]': 'panelId()',
    '[attr.role]': 'inItem ? "region" : "tabpanel"',
    '[attr.aria-labelledby]': 'stepper.stepId(resolvedValue())',
    '[attr.hidden]': '!inItem && !active() ? "" : null',
    '[attr.inert]': 'inItem && !active() ? "" : null',
  },
  viewProviders: [provideTxIconDefaults(STEPPER_ICON_DEFAULTS)],
})
export class TxStepPanel {
  private readonly stepperTheme = injectTokens(STEPPER_THEME);

  protected readonly stepper = inject(TxStepperRef);
  private readonly item = inject(TxStepItem, { optional: true });

  readonly value = input<TxStepValue | undefined>(undefined);

  protected readonly contentTemplate = contentChild(TxStepPanelContent);

  readonly inItem = !!this.item;
  readonly resolvedValue = computed(() => this.value() ?? this.item?.value());
  readonly active = computed(() => this.stepper.isActive(this.resolvedValue()));
  readonly panelId = computed(() => this.stepper.panelId(this.resolvedValue()));
  protected readonly visited = linkedSignal<boolean, boolean>({
    source: this.active,
    computation: (active, previous) => active || (previous?.value ?? false),
  });
  protected readonly context = computed<TxStepPanelContext>(() => {
    const activate = (target: TxStepValue) => this.stepper.activate(target);
    return {
      $implicit: activate,
      activate,
      value: this.resolvedValue() ?? '',
      index: this.stepper.indexOf(this.resolvedValue()),
      active: this.active(),
    };
  });
}
