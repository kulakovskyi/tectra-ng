import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TX_MASCOT_TRICKS, TxMascot, TxMascotState } from '@tectra-ng/blocks/mascot';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'mascot-tricks-example',
  imports: [TxMascot, TxButton],
  template: `
    <div class="row">
      <tx-mascot label="Mascot" [state]="state()" [playful]="false" [size]="72" />
      <div class="actions">
        @for (trick of tricks; track trick) {
          <button
            txButton
            size="small"
            severity="secondary"
            [outlined]="state() !== trick"
            [label]="trick"
            [attr.aria-pressed]="state() === trick"
            (click)="state.set(trick)"
          ></button>
        }
        <button
          txButton
          size="small"
          severity="secondary"
          label="idle"
          [text]="true"
          (click)="state.set('idle')"
        ></button>
      </div>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotTricksExample {
  readonly tricks = TX_MASCOT_TRICKS;
  readonly state = signal<TxMascotState>('waving');
}
