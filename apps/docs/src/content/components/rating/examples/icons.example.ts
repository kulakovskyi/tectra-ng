import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra/ui/rating';

@Component({
  selector: 'rating-icons-example',
  imports: [FormsModule, TxRating],
  template: `<tx-rating
    ariaLabel="Love"
    onIcon="heart-fill"
    offIcon="heart"
    [allowHalf]="true"
    [dt]="{ root: { activeColor: '#e11d48', hoverColor: '#fb7185' } }"
    [(ngModel)]="love"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingIconsExample {
  love: number | null = 2.5;
}
