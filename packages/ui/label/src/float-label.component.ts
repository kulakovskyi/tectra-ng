import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxFloatLabelVariant } from './label.types';

@Component({
  selector: 'tx-float-label',
  template: '<ng-content />',
  styleUrl: './float-label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-float-label', '[attr.data-variant]': 'variant()' },
})
export class TxFloatLabel {
  readonly variant = input<TxFloatLabelVariant>('over');
}
