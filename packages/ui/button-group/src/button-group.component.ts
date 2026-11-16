import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  injectPassThrough,
  injectTokens,
  injectUnstyled,
  TxPassThrough,
  TxPassThroughOptions,
} from '@tectra-ng/core/config';
import { injectFluid } from '@tectra-ng/core/fluid';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraButtonGroupTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { BUTTON_GROUP_THEME } from './button-group.theme';
import { TxButtonGroupOrientation, TxButtonGroupPart } from './button-group.types';

/** Joins `txButton` buttons into one block: shared borders, outer corners only, a divider between solid buttons. */
@Component({
  selector: 'tx-button-group',
  template: '<ng-content />',
  styleUrl: './button-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-button-group',
    role: 'group',
    '[class]': 'passThrough().root?.class',
    '[class.tx-button-group--vertical]': 'orientation() === "vertical"',
    '[class.tx-button-group--fluid]': 'isFluid()',
    '[style]': 'hostStyle()',
    '[attr.data-orientation]': 'orientation()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxButtonGroup {
  private readonly buttonGroupTheme = injectTokens(BUTTON_GROUP_THEME);

  readonly orientation = input<TxButtonGroupOrientation>('horizontal');
  readonly fluid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly dt = input<TectraDeepPartial<TectraButtonGroupTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxButtonGroupPart, TxButtonGroup> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });

  readonly isFluid = injectFluid(this.fluid);
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('buttonGroup', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-button-group'),
    ...this.passThrough().root?.style,
  }));
}
