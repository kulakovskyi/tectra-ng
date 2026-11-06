import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-clear-example',
  imports: [FormsModule, TxRating],
  template: `
    <div class="list">
      <tx-rating ariaLabel="With clear icon" [clearable]="true" [(ngModel)]="first" />
      <tx-rating
        ariaLabel="With clear text"
        [clearable]="true"
        clearLabel="Reset"
        [(ngModel)]="second"
      />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      gap: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingClearExample {
  first: number | null = 3;
  second: number | null = 4;
}
