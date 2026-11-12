import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxFloatLabelVariant } from './label.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { LABEL_ICON_DEFAULTS } from './label.icons';

@Component({
  selector: 'tx-float-label',
  template: '<ng-content />',
  styleUrl: './float-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-float-label', '[attr.data-variant]': 'variant()' },
  viewProviders: [provideTxIconDefaults(LABEL_ICON_DEFAULTS)],
})
export class TxFloatLabel {
  readonly variant = input<TxFloatLabelVariant>('over');
}
