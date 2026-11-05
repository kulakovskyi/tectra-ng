import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tx-button-group',
  template: '<ng-content />',
  styleUrl: './button-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-button-group', role: 'group' },
})
export class TxButtonGroup {}
