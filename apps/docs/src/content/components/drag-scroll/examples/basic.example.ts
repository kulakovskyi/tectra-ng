import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxDragScroll } from '@tectra-ng/utils/drag-scroll';

@Component({
  selector: 'drag-scroll-basic-example',
  imports: [TxButton, TxCard, TxDragScroll],
  template: `
    <div class="stack wide">
      <div class="board" txDragScroll>
        @for (column of columns; track column) {
          <tx-card class="column" [title]="column">
            <button
              txButton
              label="Add card"
              size="small"
              severity="secondary"
              (click)="last.set(column)"
            ></button>
          </tx-card>
        }
      </div>
      <span class="hint">Last clicked: {{ last() || '—' }}</span>
    </div>
  `,
  styles: `
    .wide {
      max-width: none;
    }
    .board {
      display: flex;
      gap: 12px;
      overflow-x: auto;
      padding-bottom: 8px;
    }
    .column {
      flex: 0 0 220px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DragScrollBasicExample {
  readonly columns = ['Backlog', 'Ready', 'In progress', 'Review', 'Testing', 'Done', 'Archived'];
  readonly last = signal('');
}
