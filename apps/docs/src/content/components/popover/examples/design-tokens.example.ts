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
    <button txButton severity="secondary" [outlined]="true" [txPopoverTrigger]="note">
      Release note
    </button>
    <tx-popover
      #note
      arrow
      header="Heads up"
      [dt]="{
        root: {
          background: 'var(--tx-primary-base)',
          borderColor: 'var(--tx-primary-base)',
          color: 'var(--tx-primary-contrast)',
          maxWidth: '280px',
        },
      }"
    >
      The old export links stop working next month.
    </tx-popover>
  `,
  styles: `
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PopoverDesignTokensExample {}
