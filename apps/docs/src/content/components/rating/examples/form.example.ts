import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxRating } from '@tectra-ng/ui/rating';

@Component({
  selector: 'rating-form-example',
  imports: [ReactiveFormsModule, TxField, TxRating, TxButton],
  template: `
    <div class="form">
      <tx-field
        label="How was your support chat?"
        [required]="true"
        [messages]="{ required: 'Pick a rating to send' }"
      >
        <tx-rating [formControl]="score" [clearable]="true" />
      </tx-field>
      <button txButton (click)="score.markAsTouched()">Send</button>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      justify-items: start;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingFormExample {
  readonly score = new FormControl<number | null>(null, Validators.required);
}
