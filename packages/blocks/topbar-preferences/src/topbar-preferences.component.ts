import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, output } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions, TxThemeMode } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTopbarPreferencesTokens, toStyleObject } from '@tectra-ng/themes';
import { TX_LANGUAGES, TxLanguageOption, TxSwitchLanguage } from '@tectra-ng/blocks/switch-language';
import { TxSwitchTheme } from '@tectra-ng/blocks/switch-theme';
import { TxTopbarPreferencesLayout, TxTopbarPreferencesPart } from './topbar-preferences.types';
import { TOPBAR_PREFERENCES_THEME } from './topbar-preferences.theme';

@Component({
  selector: 'tx-topbar-preferences',
  imports: [TxSwitchLanguage, TxSwitchTheme],
  templateUrl: './topbar-preferences.component.html',
  styleUrl: './topbar-preferences.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-topbar-preferences',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
    '[class.tx-topbar-preferences--raised]': 'raised()',
  },
})
export class TxTopbarPreferences {
  private readonly topbarPreferencesTheme = injectTokens(TOPBAR_PREFERENCES_THEME);

  readonly layout = input<TxTopbarPreferencesLayout>('inline');
  readonly raised = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly languages = input<readonly TxLanguageOption[]>(TX_LANGUAGES);
  readonly syncLocale = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraTopbarPreferencesTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTopbarPreferencesPart, TxTopbarPreferences> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly languageChange = output<string>();
  readonly modeChange = output<TxThemeMode>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('topbarPreferences', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-topbar-preferences'), ...this.passThrough().root?.style }));

  protected onLanguage(code: string | undefined): void {
    if (code) {
      this.languageChange.emit(code);
    }
  }
}
