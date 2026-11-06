import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-sizes-example',
  imports: [FormsModule, TxRating],
  template: `
    <div class="list">
      <tx-rating size="small" ariaLabel="Small" [ngModel]="3" />
      <tx-rating ariaLabel="Medium" [ngModel]="3" />
      <tx-rating size="large" ariaLabel="Large" [ngModel]="3" />
    </div>
  `,
  styles: `
    .list {
      display: grid;
      justify-items: start;
      gap: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingSizesExample {}
