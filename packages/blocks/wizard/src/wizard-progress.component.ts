import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraWizardTokens, toStyleObject } from '@tectra-ng/themes';
import { TxWizardProgressPart } from './wizard.types';

@Component({
  selector: 'tx-wizard-progress',
  template: `
    @if (label()) {
      <span class="tx-wizard-progress__label" aria-hidden="true" [class]="passThrough().label?.class" [style]="passThrough().label?.style">{{ label() }}</span>
    }
    <ol class="tx-wizard-progress__segments" [attr.aria-label]="label() || translations().wizardProgress" [class]="passThrough().segments?.class" [style]="passThrough().segments?.style">
      @for (segment of segments(); track $index; let position = $index) {
        <li
          class="tx-wizard-progress__segment"
          [class.tx-wizard-progress__segment--done]="position < current()"
          [class.tx-wizard-progress__segment--current]="position === current()"
          [attr.aria-current]="position === current() ? 'step' : null"
          [attr.aria-label]="stepLabels()[position] || null"
          [class]="passThrough().segment?.class"
          [style]="passThrough().segment?.style"
        >
          <span class="tx-wizard-progress__fill"></span>
        </li>
      }
    </ol>
  `,
  styleUrl: './wizard-progress.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-wizard-progress',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxWizardProgress {
  readonly total = input.required<number, unknown>({ transform: numberAttribute });
  readonly current = input.required<number, unknown>({ transform: numberAttribute });
  readonly label = input<string | undefined>(undefined);
  readonly stepLabels = input<readonly string[]>([]);
  readonly dt = input<TectraDeepPartial<TectraWizardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWizardProgressPart, TxWizardProgress> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('wizardProgress', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly segments = computed(() => Array.from({ length: Math.max(this.total(), 0) }));
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-wizard'), ...this.passThrough().root?.style }));
}
