import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'tooltip-multiline-example',
  imports: [TxTooltip, TxButton],
  template: `
    <button
      txButton
      variant="link"
      txTooltip="example-store.com&#10;Registered until 14 March 2027&#10;Auto-renew on, DNS managed here"
      tooltipMultiline
    >
      example-store.com
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipMultilineExample {}
