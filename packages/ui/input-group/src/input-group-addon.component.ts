import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tx-input-group-addon',
  template: '<ng-content />',
  styleUrl: './input-group-addon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-group-addon' },
})
export class TxInputGroupAddon {}
