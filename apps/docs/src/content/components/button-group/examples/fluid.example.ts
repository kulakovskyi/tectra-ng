import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxButtonGroup } from '@tectra-ng/ui/button-group';

@Component({
  selector: 'button-group-fluid-example',
  imports: [TxButton, TxButtonGroup],
  template: `
    <div class="panel">
      <span class="question">Will you attend the review on Friday?</span>
      <tx-button-group [fluid]="true" aria-label="Your answer">
        <button txButton [severity]="'secondary'" [outlined]="true" (click)="answer.set('No')">
          No
        </button>
        <button txButton [severity]="'secondary'" [outlined]="true" (click)="answer.set('Maybe')">
          Maybe
        </button>
        <button txButton [severity]="'secondary'" [outlined]="true" (click)="answer.set('Yes')">
          Yes
        </button>
      </tx-button-group>
      <span class="status" aria-live="polite">Answer: {{ answer() }}</span>
    </div>
  `,
  styles: `
    .panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 360px;
    }
    .question {
      font-weight: var(--tx-font-weight-medium);
    }
    .status {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonGroupFluidExample {
  readonly answer = signal('not given');
}
