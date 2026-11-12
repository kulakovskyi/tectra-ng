import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxIconField } from './icon-field.component';
import { ICON_FIELD_ICON_DEFAULTS } from './icon-field.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { ICON_FIELD_THEME } from './icon-field.theme';

@Component({
  selector: 'tx-input-clear',
  imports: [TxIcon],
  template: `
    @if (field.hasValue() && field.isEditable()) {
      <button type="button" class="tx-input-action" [attr.aria-label]="translations().clear" [title]="translations().clear" (click)="clear()">
        <tx-icon [name]="'times'" />
      </button>
    }
  `,
  styleUrl: './input-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-clear' },
  viewProviders: [provideTxIconDefaults(ICON_FIELD_ICON_DEFAULTS)],
})
export class TxInputClear {
  private readonly iconFieldTheme = injectTokens(ICON_FIELD_THEME);

  readonly field = inject(TxIconField);
  readonly translations = injectTranslations();

  readonly cleared = output<void>();

  clear(): void {
    this.field.clear();
    this.cleared.emit();
  }
}
