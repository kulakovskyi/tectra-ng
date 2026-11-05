import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxToggleButton } from '@tectra/ui/toggle-button';

@Component({
  selector: 'toggle-button-basic-example',
  imports: [TxToggleButton],
  template: `<tx-toggle-button [onLabel]="'On'" [offLabel]="'Off'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToggleButtonBasicExample {}
