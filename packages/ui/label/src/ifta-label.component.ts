import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { LABEL_ICON_DEFAULTS } from './label.icons';

@Component({
  selector: 'tx-ifta-label',
  template: '<ng-content />',
  styleUrl: './ifta-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-ifta-label' },
  viewProviders: [provideTxIconDefaults(LABEL_ICON_DEFAULTS)],
})
export class TxIftaLabel {}
