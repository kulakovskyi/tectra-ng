import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMascot, TxMascotState } from '@tectra-ng/blocks/mascot';

@Component({
  selector: 'mascot-states-example',
  imports: [TxMascot],
  template: `
    <div class="grid">
      @for (state of states; track state) {
        <figure class="cell">
          <tx-mascot [state]="state" [playful]="false" [size]="56" [label]="state" />
          <figcaption>{{ state }}</figcaption>
        </figure>
      }
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }

    .cell {
      display: grid;
      justify-items: center;
      gap: 8px;
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MascotStatesExample {
  readonly states: TxMascotState[] = ['idle', 'thinking', 'happy', 'sleeping', 'walking'];
}
