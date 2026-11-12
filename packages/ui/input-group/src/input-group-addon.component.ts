import { ChangeDetectionStrategy, Component } from '@angular/core';
import { injectTokens } from '@tectra-ng/core/config';
import { INPUT_GROUP_THEME } from './input-group.theme';

@Component({
  selector: 'tx-input-group-addon',
  template: '<ng-content />',
  styleUrl: './input-group-addon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-group-addon' },
})
export class TxInputGroupAddon {
  private readonly inputGroupTheme = injectTokens(INPUT_GROUP_THEME);
}
