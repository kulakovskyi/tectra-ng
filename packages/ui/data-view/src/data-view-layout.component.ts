import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { injectTokens, injectUnstyled } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxButton, TxButtonSize } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';
import { TxDataViewLayout } from './data-view.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { DATA_VIEW_ICON_DEFAULTS } from './data-view.icons';
import { DATA_VIEW_THEME } from './data-view.theme';

@Component({
  selector: 'tx-data-view-layout',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group role="group" [attr.aria-label]="ariaLabel() ?? translations().layout">
      <button
        txButton
        type="button"
        icon="bars"
        severity="secondary"
        [size]="size()"
        [outlined]="layout() !== 'list'"
        [unstyled]="isUnstyled()"
        [attr.aria-label]="translations().listView"
        [attr.aria-pressed]="layout() === 'list'"
        (click)="layout.set('list')"
      ></button>
      <button
        txButton
        type="button"
        icon="th-large"
        severity="secondary"
        [size]="size()"
        [outlined]="layout() !== 'grid'"
        [unstyled]="isUnstyled()"
        [attr.aria-label]="translations().gridView"
        [attr.aria-pressed]="layout() === 'grid'"
        (click)="layout.set('grid')"
      ></button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-data-view-layout' },
  viewProviders: [provideTxIconDefaults(DATA_VIEW_ICON_DEFAULTS)],
})
export class TxDataViewLayoutSwitch {
  private readonly dataViewTheme = injectTokens(DATA_VIEW_THEME);

  readonly layout = model<TxDataViewLayout>('list');
  readonly size = input<TxButtonSize>('medium');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
}
