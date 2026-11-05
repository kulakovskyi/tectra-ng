import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra/ui/rating';

@Component({
  selector: 'rating-stars-example',
  imports: [FormsModule, TxRating],
  template: `<tx-rating ariaLabel="Out of ten" [stars]="10" [(ngModel)]="score" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingStarsExample {
  score: number | null = 7;
}
