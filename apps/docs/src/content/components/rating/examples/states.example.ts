import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra/ui/rating';

@Component({
  selector: 'rating-states-example',
  imports: [FormsModule, TxRating],
  template: `
    <div class="list">
      <div class="review">
        <tx-rating
          size="small"
          ariaLabel="Average rating"
          [readonly]="true"
          [allowHalf]="true"
          [ngModel]="4.5"
        />
        <span class="hint">4.5 · 128 reviews</span>
      </div>
      <tx-rating ariaLabel="Disabled" [disabled]="true" [ngModel]="2" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 10px;
    }

    .review {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingStatesExample {}
