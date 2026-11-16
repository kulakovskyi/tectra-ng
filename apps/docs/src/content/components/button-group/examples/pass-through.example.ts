import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-pass-through-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <tx-button-group aria-label="Raised actions" [pt]="raised">
      <button txButton [icon]="'check'">Approve</button>
      <button txButton [icon]="'times'">Reject</button>
    </tx-button-group>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupPassThroughExample {
  readonly raised = {
    root: {
      style: {
        borderRadius: 'var(--tx-button-border-radius)',
        boxShadow: 'var(--tx-shadow-overlay)',
      },
    },
  };
}
