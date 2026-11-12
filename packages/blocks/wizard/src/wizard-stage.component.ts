import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraWizardTokens, toStyleObject } from '@tectra-ng/themes';
import { TxWizardLayout } from './wizard-layout.component';
import { TxWizardDirection, TxWizardStagePart } from './wizard.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { WIZARD_ICON_DEFAULTS } from './wizard.icons';
import { WIZARD_THEME } from './wizard.theme';

@Component({
  selector: 'tx-wizard-stage',
  imports: [DecimalPipe],
  template: `
    <ng-content select="[txWizardBackdrop]" />
    <div class="tx-wizard-stage__stage" aria-hidden="true" [class]="passThrough().stage?.class" [style]="passThrough().stage?.style">
      <ng-content />
    </div>
    @if (caption(); as text) {
      @for (current of [text]; track current) {
        <div class="tx-wizard-stage__caption" animate.enter="tx-wizard-stage__caption--enter" [class]="passThrough().caption?.class" [style]="passThrough().caption?.style">
          @if (number() !== undefined) {
            <span class="tx-wizard-stage__number">{{ number() | number: '2.0-0' }}</span>
          }
          <span class="tx-wizard-stage__title">{{ current }}</span>
        </div>
      }
    }
  `,
  styleUrl: './wizard-stage.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-wizard-stage',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-direction]': 'direction()',
    '[attr.data-responsive]': 'responsive()',
  },
  viewProviders: [provideTxIconDefaults(WIZARD_ICON_DEFAULTS)],
})
export class TxWizardStage {
  private readonly wizardTheme = injectTokens(WIZARD_THEME);

  private readonly layout = inject(TxWizardLayout, { optional: true });

  readonly direction = input<TxWizardDirection>('forward');
  readonly number = input<number | undefined>(undefined);
  readonly caption = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraWizardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWizardStagePart, TxWizardStage> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('wizardStage', this, this.pt, this.ptOptions);
  protected readonly responsive = computed(() => this.layout?.responsive() ?? 'viewport');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-wizard'), ...this.passThrough().root?.style }));
}
