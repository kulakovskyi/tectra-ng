import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxScrollPanel } from '@tectra-ng/ui/scroll-panel';

@Component({
  selector: 'scroll-panel-both-axes-example',
  imports: [TxScrollPanel],
  template: `
    <tx-scroll-panel class="panel" ariaLabel="Seat map">
      <div class="grid">
        @for (seat of seats; track seat) {
          <span class="seat">{{ seat }}</span>
        }
      </div>
    </tx-scroll-panel>
  `,
  styles: `
    .panel {
      height: 200px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(16, 64px);
      gap: 8px;
      padding: 0 12px 12px 0;
    }

    .seat {
      padding: 8px 0;
      border: 1px dashed currentColor;
      border-radius: 6px;
      text-align: center;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ScrollPanelBothAxesExample {
  readonly seats = Array.from(
    { length: 160 },
    (_, index) => `${String.fromCharCode(65 + Math.floor(index / 16))}${(index % 16) + 1}`,
  );
}
