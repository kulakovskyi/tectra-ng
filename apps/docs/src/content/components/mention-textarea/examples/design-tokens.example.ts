import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMentionTextarea } from '@tectra-ng/ui/mention-textarea';

@Component({
  selector: 'mention-textarea-design-tokens-example',
  imports: [TxMentionTextarea],
  template: `<tx-mention-textarea
    [suggestions]="people"
    [ariaLabel]="'Note'"
    [placeholder]="'Type @'"
    [dt]="{ root: { panelWidth: '360px', descriptionColor: 'var(--tx-primary-base)' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentionTextareaDesignTokensExample {
  readonly people = [
    { label: 'Olena Kovalenko', value: 'olena', description: 'Design' },
    { label: 'Oleh Marchenko', value: 'oleh', description: 'Backend' },
    { label: 'Taras Shevchuk', value: 'taras', description: 'Frontend' },
    { label: 'Iryna Bondar', value: 'iryna', description: 'Product' },
    { label: 'Sofia Melnyk', value: 'sofia', description: 'Support' },
  ];
}
