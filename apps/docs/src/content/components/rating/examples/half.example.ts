import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-half-example',
  imports: [FormsModule, TxRating],
  template: `
    <tx-rating ariaLabel="Half stars" [allowHalf]="true" [(ngModel)]="score" />
    <p class="hint">Value: {{ score ?? 'none' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingHalfExample {
  score: number | null = 3.5;
}
