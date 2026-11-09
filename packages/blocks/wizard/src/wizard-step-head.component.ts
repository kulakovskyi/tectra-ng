import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraWizardTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPill } from '@tectra-ng/ui/pill';
import { TxWizardStepHeadPart } from './wizard.types';

@Component({
  selector: 'tx-wizard-step-head',
  imports: [TxIcon, TxPill],
  template: `
    @if (icon(); as name) {
      <span class="tx-wizard-step-head__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        <tx-icon [name]="name" />
      </span>
    }
    <div class="tx-wizard-step-head__title-row">
      <h1 class="tx-wizard-step-head__title" [class]="passThrough().title?.class" [style]="passThrough().title?.style">{{ title() }}</h1>
      @if (badge()) {
        <tx-pill tone="neutral" size="small" [value]="badge()" [unstyled]="isUnstyled()" />
      }
    </div>
    @if (lead()) {
      <p class="tx-wizard-step-head__lead" [class]="passThrough().lead?.class" [style]="passThrough().lead?.style">{{ lead() }}</p>
    }
  `,
  styleUrl: './wizard-step-head.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-wizard-step-head',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxWizardStepHead {
  readonly title = input.required<string>();
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly lead = input<string | undefined>(undefined);
  readonly badge = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraWizardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWizardStepHeadPart, TxWizardStepHead> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('wizardStepHead', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-wizard'), ...this.passThrough().root?.style }));
}
