import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABLE_ICON_DEFAULTS } from './table.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { TABLE_THEME } from './table.theme';

@Component({
  selector: 'tx-table-styles',
  template: '',
  styleUrl: './table.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableStyles {
  private readonly tableTheme = injectTokens(TABLE_THEME);
}
