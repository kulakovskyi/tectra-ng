import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxConfetti } from '@tectra-ng/blocks/confetti';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'confetti-with-delay-example',
  imports: [TxConfetti, TxEmptyState, TxButton],
  template: `
    <div class="scene">
      @if (confirmed()) {
        <tx-empty-state
          icon="envelope"
          tone="success"
          title="E-mail confirmed"
          text="You can sign in now."
        >
          <button txButton severity="secondary" text (click)="confirmed.set(false)">
            Start over
          </button>
        </tx-empty-state>
        <tx-confetti [delay]="380" />
      } @else {
        <button txButton icon="check" (click)="confirmed.set(true)">Confirm e-mail</button>
      }
    </div>
  `,
  styles: `
    .scene {
      position: relative;
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 300px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfettiWithDelayExample {
  readonly confirmed = signal(false);
}
