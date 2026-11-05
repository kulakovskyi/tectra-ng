import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMentionTextarea } from '@tectra/ui/mention-textarea';

@Component({
  selector: 'mention-textarea-basic-example',
  imports: [TxMentionTextarea, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-mention-textarea
        [formControl]="comment"
        [suggestions]="people"
        [placeholder]="'Leave a comment, @ to mention'"
        [ariaLabel]="'Comment'"
        (mentionsChange)="mentioned.set($event)"
      />
      <span class="hint">Mentioned: {{ mentioned().join(', ') || 'nobody' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentionTextareaBasicExample {
  readonly people = [
    { label: 'Olena Kovalenko', value: 'olena', description: 'Design' },
    { label: 'Oleh Marchenko', value: 'oleh', description: 'Backend' },
    { label: 'Taras Shevchuk', value: 'taras', description: 'Frontend' },
    { label: 'Iryna Bondar', value: 'iryna', description: 'Product' },
    { label: 'Sofia Melnyk', value: 'sofia', description: 'Support' },
  ];
  readonly comment = new FormControl('');
  readonly mentioned = signal<string[]>([]);
}
