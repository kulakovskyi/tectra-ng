import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectFluid } from '@tectra-ng/core/fluid';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTokens } from '@tectra-ng/core/config';
import { INPUT_GROUP_THEME } from './input-group.theme';

@Component({
  selector: 'tx-input-group',
  template: '<ng-content />',
  styleUrl: './input-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-input-group', role: 'group', '[class.tx-input-group--fluid]': 'isFluid()' },
})
export class TxInputGroup {
  private readonly inputGroupTheme = injectTokens(INPUT_GROUP_THEME);

  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly isFluid = injectFluid(this.fluid);
}
