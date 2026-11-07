import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEditor, TxEditorMentionItem } from '@tectra-ng/editor';

const PEOPLE: TxEditorMentionItem[] = [
  { id: '1', label: 'Anna Kovalenko', description: 'Design' },
  { id: '2', label: 'Max Petrenko', description: 'Engineering' },
  { id: '3', label: 'Olena Shevchuk', description: 'Marketing' },
  { id: '4', label: 'Ivan Bondar', description: 'Support' },
];

@Component({
  selector: 'editor-mentions-example',
  imports: [TxEditor],
  template: `
    <tx-editor
      toolbar="minimal"
      placeholder="Write a comment, type @ to mention someone"
      minHeight="120px"
      [mentions]="find"
      (mentionSelected)="mentioned.set($event.label)"
    />
    <p class="note">Last mentioned: {{ mentioned() || 'nobody yet' }}</p>
  `,
  styles: `
    .note {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EditorMentionsExample {
  readonly mentioned = signal('');
  readonly find = (query: string) =>
    PEOPLE.filter((person) => person.label.toLowerCase().includes(query.toLowerCase()));
}
