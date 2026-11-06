import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-basic-example',
  imports: [FormsModule, TxRating],
  template: `
    <tx-rating ariaLabel="Rate this article" [(ngModel)]="score" />
    <p class="hint">Value: {{ score ?? 'none' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingBasicExample {
  score: number | null = 4;
}
