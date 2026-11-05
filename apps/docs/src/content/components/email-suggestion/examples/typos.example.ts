import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxEmailSuggestion } from '@tectra/ui/email-suggestion';

@Component({
  selector: 'email-suggestion-typos-example',
  imports: [TxEmailSuggestion],
  template: `
    <div class="stack">
      @for (sample of samples; track sample) {
        <div class="row">
          <code>{{ sample }}</code>
          <tx-email-suggestion
            [value]="sample"
            [knownDomains]="known"
            (applied)="picked.set($event)"
          />
        </div>
      }
      <span class="hint">Picked: {{ picked() || '—' }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmailSuggestionTyposExample {
  readonly samples = ['taras@gmial.com', 'iryna@outlok.com', 'sofia@example.cmo'];
  readonly known = ['gmail.com', 'outlook.com', 'example.com'];
  readonly picked = signal('');
}
