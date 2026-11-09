import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TxConfetti } from '@tectra-ng/blocks/confetti';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'confetti-design-tokens-example',
  imports: [TxConfetti, TxButton],
  template: `
    <div class="scene">
      <button txButton severity="secondary" outlined icon="refresh" (click)="confetti().play()">
        Play again
      </button>
      <tx-confetti
        [dt]="{
          piece: { size: '14px', borderRadius: '50%' },
          colors: { accent: '#f59e0b', neutral: '#ec4899', success: '#06b6d4' },
          motion: { duration: '1.6s' },
        }"
      />
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
export default class ConfettiDesignTokensExample {
  readonly confetti = viewChild.required(TxConfetti);
}
