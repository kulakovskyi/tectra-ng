import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxRating } from '@tectra/ui/rating';

@Component({
  selector: 'rating-design-tokens-example',
  imports: [FormsModule, TxRating],
  template: `<tx-rating ariaLabel="Teal stars" [dt]="tokens" [(ngModel)]="score" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RatingDesignTokensExample {
  readonly tokens = {
    root: { activeColor: '#0f766e', hoverColor: '#14b8a6', iconSize: '24px', gap: '8px' },
  };
  score: number | null = 3;
}
