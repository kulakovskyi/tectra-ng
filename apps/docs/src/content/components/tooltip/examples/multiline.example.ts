import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTooltip } from '@tectra/ui/tooltip';

@Component({
  selector: 'tooltip-multiline-example',
  imports: [TxTooltip],
  template: `
    <button
      type="button"
      class="domain"
      txTooltip="example-store.com&#10;Registered until 14 March 2027&#10;Auto-renew on, DNS managed here"
      tooltipMultiline
    >
      example-store.com
    </button>
  `,
  styles: `
    .domain {
      padding: 0;
      border: 0;
      background: none;
      color: var(--tx-primary-soft-text);
      font: inherit;
      cursor: default;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipMultilineExample {}
