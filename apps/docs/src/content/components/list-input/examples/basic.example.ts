import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-basic-example',
  imports: [TxListInput],
  template: `
    <tx-list-input
      type="domain"
      ariaLabel="Domains"
      [(text)]="text"
      (itemsChange)="domains.set($event)"
    />
    <p class="result">Will check: {{ domains().join(', ') || '—' }}</p>
  `,
  styles: `
    .result {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputBasicExample {
  readonly text = signal('');
  readonly domains = signal<string[]>([]);
}
