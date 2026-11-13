import { ChangeDetectionStrategy, Component, computed, inject, input, numberAttribute, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions, TxThemeMode, TxThemeService } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraSwitchThemeTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSwitchThemePart } from './switch-theme.types';
import { TX_THEME_REVEAL_EASING, TxThemeReveal } from './theme-reveal.directive';
import { SWITCH_THEME_ICON_DEFAULTS } from './switch-theme.icons';
import { SWITCH_THEME_THEME } from './switch-theme.theme';

/** A round button that switches between the light and the dark theme. */
@Component({
  selector: 'tx-switch-theme',
  imports: [TxIcon, TxThemeReveal],
  template: `
    <button
      type="button"
      class="tx-switch-theme__button"
      txThemeReveal
      [revealDuration]="revealDuration()"
      [revealEasing]="revealEasing()"
      [attr.aria-label]="label()"
      [title]="label()"
      [class]="passThrough().button?.class"
      [style]="passThrough().button?.style"
      (themeChange)="toggle()"
    >
      <tx-icon
        class="tx-switch-theme__icon tx-switch-theme__icon--sun"
        name="sun"
        aria-hidden="true"
        [class.tx-switch-theme__icon--hidden]="dark()"
        [class]="passThrough().icon?.class"
        [style]="passThrough().icon?.style"
      />
      <tx-icon
        class="tx-switch-theme__icon tx-switch-theme__icon--moon"
        name="moon"
        aria-hidden="true"
        [class.tx-switch-theme__icon--hidden]="!dark()"
        [class]="passThrough().icon?.class"
        [style]="passThrough().icon?.style"
      />
    </button>
  `,
  styleUrl: './switch-theme.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-switch-theme',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-mode]': 'theme.mode()',
  },
  viewProviders: [provideTxIconDefaults(SWITCH_THEME_ICON_DEFAULTS)],
})
export class TxSwitchTheme {
  private readonly switchThemeTheme = injectTokens(SWITCH_THEME_THEME);

  protected readonly theme = inject(TxThemeService);

  readonly revealDuration = input<number, unknown>(550, { transform: numberAttribute });
  readonly revealEasing = input<string>(TX_THEME_REVEAL_EASING);
  readonly dt = input<TectraDeepPartial<TectraSwitchThemeTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSwitchThemePart, TxSwitchTheme> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly modeChange = output<TxThemeMode>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('switchTheme', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-switch-theme'), ...this.passThrough().root?.style }));
  protected readonly dark = computed(() => this.theme.mode() === 'dark');
  protected readonly label = computed(() => (this.dark() ? this.translations().switchToLight : this.translations().switchToDark));

  toggle(): void {
    this.theme.toggleMode();
    this.modeChange.emit(this.theme.mode());
  }
}
