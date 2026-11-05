import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxButtonSeverity, TxButtonSize } from './button.types';

@Component({
  selector: 'button[txButton], a[txButton]',
  template: '<ng-content />',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-button',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'size()',
    '[class.tx-button--outlined]': 'outlined()',
  },
})
export class TxButton {
  severity = input<TxButtonSeverity>('primary');
  size = input<TxButtonSize>('medium');
  outlined = input<boolean>(false);
}
