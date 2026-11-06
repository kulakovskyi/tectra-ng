import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMentionItem, TxMentionTextarea } from '@tectra-ng/ui/mention-textarea';
import { TxSelectFilterEvent } from '@tectra-ng/ui/select';

const DIRECTORY: TxMentionItem[] = Array.from({ length: 200 }, (_, index) => ({
  label: `Teammate ${index + 1}`,
  value: `teammate-${index + 1}`,
  description: ['Design', 'Backend', 'Frontend', 'Support'][index % 4],
}));

@Component({
  selector: 'mention-textarea-server-example',
  imports: [TxMentionTextarea],
  template: `<tx-mention-textarea
    [suggestions]="results()"
    [localSearch]="false"
    [loading]="loading()"
    [filterDelay]="200"
    [autoResize]="true"
    [lines]="3"
    [ariaLabel]="'Message'"
    [placeholder]="'Type @ and a number'"
    (filtered)="search($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MentionTextareaServerExample {
  readonly results = signal<TxMentionItem[]>([]);
  readonly loading = signal(false);

  search(event: TxSelectFilterEvent): void {
    this.loading.set(true);
    setTimeout(() => {
      const query = event.query.toLowerCase();
      this.results.set(
        DIRECTORY.filter((person) => person.label.toLowerCase().includes(query)).slice(0, 8),
      );
      this.loading.set(false);
    }, 400);
  }
}
