import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMentionTextarea } from '@tectra/ui/mention-textarea';
import { TxSelectOptionTemplate } from '@tectra/ui/select';

@Component({
  selector: 'mention-textarea-trigger-example',
  imports: [TxMentionTextarea, TxSelectOptionTemplate],
  template: `
    <tx-mention-textarea
      [suggestions]="issues"
      [trigger]="'#'"
      [ariaLabel]="'Release notes'"
      [placeholder]="'Type # to link an issue'"
    >
      <ng-template txSelectOption let-issue>
        <span class="issue">
          <strong>{{ issue.label }}</strong>
          <span class="hint">{{ issue.description }}</span>
        </span>
      </ng-template>
    </tx-mention-textarea>
  `,
  styles: `
    .issue {
      display: flex;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentionTextareaTriggerExample {
  readonly issues = [
    { label: '1024', value: '1024', description: 'Dark mode for charts' },
    { label: '1031', value: '1031', description: 'Export to CSV' },
    { label: '1040', value: '1040', description: 'Keyboard shortcuts' },
  ];
}
