import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraWizardTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxWizardFooterPart } from './wizard.types';
import { WIZARD_ICON_DEFAULTS } from './wizard.icons';
import { WIZARD_THEME } from './wizard.theme';

@Component({
  selector: 'tx-wizard-footer',
  imports: [TxButton],
  template: `
    @if (showBack()) {
      <button
        txButton
        type="button"
        severity="secondary"
        outlined
        icon="arrow-left"
        [disabled]="loading()"
        [unstyled]="isUnstyled()"
        [class]="passThrough().back?.class"
        [style]="passThrough().back?.style"
        (click)="back.emit()"
      >
        {{ backLabel() ?? translations().wizardBack }}
      </button>
    }
    <div class="tx-wizard-footer__end">
      @if (skipLabel(); as skipText) {
        <button
          txButton
          type="button"
          severity="secondary"
          text
          [disabled]="loading()"
          [unstyled]="isUnstyled()"
          [class]="passThrough().skip?.class"
          [style]="passThrough().skip?.style"
          (click)="skip.emit()"
        >
          {{ skipText }}
        </button>
      }
      <button
        txButton
        type="button"
        [icon]="nextIcon()"
        [loading]="loading()"
        [disabled]="loading()"
        [unstyled]="isUnstyled()"
        [class]="passThrough().next?.class"
        [style]="passThrough().next?.style"
        (click)="next.emit()"
      >
        {{ nextLabel() ?? translations().wizardNext }}
      </button>
    </div>
  `,
  styleUrl: './wizard-footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-wizard-footer',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(WIZARD_ICON_DEFAULTS)],
})
export class TxWizardFooter {
  private readonly wizardTheme = injectTokens(WIZARD_THEME);

  readonly nextLabel = input<string | undefined>(undefined);
  readonly nextIcon = input<TxIconName | (string & {})>('arrow-right');
  readonly backLabel = input<string | undefined>(undefined);
  readonly showBack = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly skipLabel = input<string | undefined>(undefined);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraWizardTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxWizardFooterPart, TxWizardFooter> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly back = output<void>();
  readonly next = output<void>();
  readonly skip = output<void>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('wizardFooter', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-wizard'), ...this.passThrough().root?.style }));
}
