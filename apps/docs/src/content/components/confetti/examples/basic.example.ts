import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TxConfetti } from '@tectra-ng/blocks/confetti';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'confetti-basic-example',
  imports: [TxConfetti, TxEmptyState, TxButton],
  template: `
    <div class="scene">
      <tx-empty-state
        icon="check"
        tone="success"
        title="Payment received"
        text="Your workspace is now on the Pro plan."
      >
        <button txButton severity="secondary" outlined icon="refresh" (click)="confetti().play()">
          Play again
        </button>
      </tx-empty-state>
      <tx-confetti />
    </div>
  `,
  styles: `
    .scene {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfettiBasicExample {
  readonly confetti = viewChild.required(TxConfetti);
}
