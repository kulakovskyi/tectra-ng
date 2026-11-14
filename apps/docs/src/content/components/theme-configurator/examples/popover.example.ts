import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxThemeConfigurator } from '@tectra-ng/blocks/theme-configurator';
import { edgeStyle, softStyle, tectraStyle } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';

@Component({
  selector: 'theme-configurator-popover-example',
  imports: [TxButton, TxPopover, TxPopoverTrigger, TxThemeConfigurator],
  template: `
    <button txButton outlined severity="secondary" icon="palette" [txPopoverTrigger]="panel">
      Appearance
    </button>
    <tx-popover #panel placement="bottom-start" ariaLabel="Appearance">
      <tx-theme-configurator [styles]="styles" />
    </tx-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ThemeConfiguratorPopoverExample {
  readonly styles = [tectraStyle, softStyle, edgeStyle];
}
