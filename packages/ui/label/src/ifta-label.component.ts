import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { LABEL_ICON_DEFAULTS } from './label.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { LABEL_THEME } from './label.theme';

@Component({
  selector: 'tx-ifta-label',
  template: '<ng-content />',
  styleUrl: './ifta-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-ifta-label' },
  viewProviders: [provideTxIconDefaults(LABEL_ICON_DEFAULTS)],
})
export class TxIftaLabel {
  private readonly labelTheme = injectTokens(LABEL_THEME);
}
