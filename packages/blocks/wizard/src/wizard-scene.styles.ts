import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { injectTokens } from '@tectra-ng/core/config';
import { WIZARD_THEME } from './wizard.theme';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { WIZARD_ICON_DEFAULTS } from './wizard.icons';

@Component({
  selector: 'tx-wizard-scene-styles',
  template: '',
  styleUrl: './wizard-scene.styles.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideTxIconDefaults(WIZARD_ICON_DEFAULTS)],
})
export class TxWizardSceneStyles {
  private readonly wizardTheme = injectTokens(WIZARD_THEME);
}
