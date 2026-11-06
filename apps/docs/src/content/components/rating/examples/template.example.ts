import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating, TxRatingOffIconTemplate, TxRatingOnIconTemplate } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-template-example',
  imports: [FormsModule, TxRating, TxRatingOnIconTemplate, TxRatingOffIconTemplate],
  template: `
    <tx-rating ariaLabel="Mood" [stars]="5" [(ngModel)]="mood">
      <ng-template txRatingOnIcon let-index
        ><span class="face">{{ faces[index] }}</span></ng-template
      >
      <ng-template txRatingOffIcon let-index
        ><span class="face off">{{ faces[index] }}</span></ng-template
      >
    </tx-rating>
  `,
  styles: `
    .face {
      display: block;
      width: 1em;
      line-height: 1;
      text-align: center;
    }

    .off {
      filter: grayscale(1);
      opacity: 0.35;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingTemplateExample {
  readonly faces = ['😞', '🙁', '😐', '🙂', '😄'];
  mood: number | null = 4;
}
