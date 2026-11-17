import { Directive, computed, inject, input } from '@angular/core';
import { injectTokens, injectUnstyled } from '@tectra-ng/core/config';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxWizardSceneStyles } from './wizard-scene.styles';
import { TxWizardDirection } from './wizard.types';
import { WIZARD_THEME } from './wizard.theme';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { WIZARD_ICON_DEFAULTS } from './wizard.icons';

/**
 * Makes any element a wizard scene: with `animate.enter="tx-wizard-scene--enter"` and
 * `animate.leave="tx-wizard-scene--leave"` it slides in and out like the scenes of `tx-wizard-stage`, also
 * outside a stage.
 */
@Directive({
  selector: '[txWizardScene]',
  host: {
    class: 'tx-wizard-scene',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[style.--tx-wizard-direction]': 'shift()',
  },
  providers: [provideTxIconDefaults(WIZARD_ICON_DEFAULTS)],
})
export class TxWizardScene {
  private readonly wizardTheme = injectTokens(WIZARD_THEME);

  readonly direction = input<TxWizardDirection | null | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  protected readonly shift = computed(() => {
    const direction = this.direction();
    return direction ? (direction === 'back' ? -1 : 1) : null;
  });

  constructor() {
    inject(TxStyleLoader).load(TxWizardSceneStyles);
  }
}
