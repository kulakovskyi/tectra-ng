import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectFluid } from '@tectra-ng/core/fluid';
import { optionalBoolean } from '@tectra-ng/core/utils';

@Component({
  selector: 'tx-input-group',
  template: '<ng-content />',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-group', role: 'group', '[class.tx-input-group--fluid]': 'isFluid()' },
})
export class TxInputGroup {
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly isFluid = injectFluid(this.fluid);
}
