import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMentionTextarea } from '@tectra-ng/ui/mention-textarea';

@Component({
  selector: 'mention-textarea-states-example',
  imports: [TxMentionTextarea, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-mention-textarea
        [formControl]="shown"
        [readonly]="true"
        [lines]="2"
        [ariaLabel]="'Read only'"
      />
      <tx-mention-textarea [formControl]="locked" [lines]="2" [ariaLabel]="'Disabled'" />
      <tx-mention-textarea [invalid]="true" [lines]="2" [ariaLabel]="'Invalid'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentionTextareaStatesExample {
  readonly shown = new FormControl('Thanks @Olena Kovalenko for the review!');
  readonly locked = new FormControl({ value: 'Locked text', disabled: true });
}
