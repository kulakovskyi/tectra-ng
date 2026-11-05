import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'tx-ifta-label',
  template: '<ng-content />',
  styleUrl: './ifta-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-ifta-label' },
})
export class TxIftaLabel {}
