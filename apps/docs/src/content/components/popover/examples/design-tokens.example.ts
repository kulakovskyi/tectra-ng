import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';

@Component({
  selector: 'popover-design-tokens-example',
  imports: [TxPopover, TxPopoverTrigger, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" [txPopoverTrigger]="tip">
      What is new
    </button>
    <tx-popover
      #tip
      arrow
      header="Version 2.4"
      closeButton
      [dt]="{
        root: {
          background: 'var(--tx-primary-soft)',
          borderColor: 'var(--tx-primary-base)',
          borderRadius: 'var(--tx-radius-md)',
          maxWidth: '280px',
        },
        arrow: { size: '12px' },
      }"
    >
      Reports can now be shared with a link and exported to CSV.
    </tx-popover>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverDesignTokensExample {}
