import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TxConfetti, TxConfettiPiece, TxConfettiTone } from '@tectra-ng/blocks/confetti';
import { TxButton } from '@tectra-ng/ui/button';

const TONES: TxConfettiTone[] = ['accent', 'neutral', 'success'];

@Component({
  selector: 'confetti-own-pieces-example',
  imports: [TxConfetti, TxButton],
  template: `
    <div class="scene">
      <button txButton icon="star" (click)="confetti().play()">Celebrate</button>
      <tx-confetti [pieces]="ring" />
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
export default class ConfettiOwnPiecesExample {
  readonly confetti = viewChild.required(TxConfetti);
  readonly ring: TxConfettiPiece[] = Array.from({ length: 18 }, (_, index) => {
    const angle = (index / 18) * Math.PI * 2;
    return {
      x: Math.round(Math.cos(angle) * 130),
      y: Math.round(Math.sin(angle) * 130),
      rotate: index * 40,
      tone: TONES[index % TONES.length],
    };
  });
}
