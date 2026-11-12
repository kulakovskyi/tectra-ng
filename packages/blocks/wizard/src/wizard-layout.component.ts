import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraWizardTokens, toStyleObject } from '@tectra-ng/themes';
import { TxWizardLayoutPart, TxWizardResponsive } from './wizard.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { WIZARD_ICON_DEFAULTS } from './wizard.icons';
import { WIZARD_THEME } from './wizard.theme';

@Component({
  selector: 'tx-wizard-layout',
  template: `
    <div class="tx-wizard-layout__grid">
    <section class="tx-wizard-layout__panel" [class]="passThrough().panel?.class" [style]="passThrough().panel?.style">
      <div class="tx-wizard-layout__inner">
        <div class="tx-wizard-layout__header" [class]="passThrough().header?.class" [style]="passThrough().header?.style">
          <ng-content select="[txWizardHeader]" />
        </div>
        <div class="tx-wizard-layout__main">
          <div class="tx-wizard-layout__body" [class]="passThrough().body?.class" [style]="passThrough().body?.style">
            <ng-content select="[txWizardBody]" />
          </div>
          <div class="tx-wizard-layout__footer" [class]="passThrough().footer?.class" [style]="passThrough().footer?.style">
            <ng-content select="[txWizardFooter]" />
          </div>
        </div>
      </div>
    </section>
    <aside class="tx-wizard-layout__visual" [class]="passThrough().visual?.class" [style]="passThrough().visual?.style">
      <ng-content select="[txWizardVisual]" />
    </aside>
    </div>
  `,
  styleUrl: './wizard-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-wizard-layout',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-responsive]': 'responsive()',
  },
  viewProviders: [provideTxIconDefaults(WIZARD_ICON_DEFAULTS)],
})
export class TxWizardLayout {
  private readonly wizardTheme = injectTokens(WIZARD_THEME);

  readonly responsive = input<TxWizardResponsive>('viewport');
  readonly dt = input<TectraDeepPartial<TectraWizardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWizardLayoutPart, TxWizardLayout> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('wizardLayout', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-wizard'), ...this.passThrough().root?.style }));
}
