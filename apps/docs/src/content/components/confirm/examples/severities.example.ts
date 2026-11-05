import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxConfirmService, TxConfirmSeverity } from '@tectra/ui/confirm';

@Component({
  selector: 'confirm-severities-example',
  imports: [TxButton],
  template: `
    <div class="row">
      @for (item of items; track item.severity) {
        <button
          txButton
          [severity]="item.severity"
          [outlined]="true"
          (click)="ask(item.severity, item.title)"
        >
          {{ item.severity }}
        </button>
      }
    </div>
    <p class="answer">Last answer: {{ answer() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .answer {
      margin: 12px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmSeveritiesExample {
  private confirm = inject(TxConfirmService);
  readonly answer = signal('—');
  readonly items: { severity: TxConfirmSeverity; title: string }[] = [
    { severity: 'primary', title: 'Publish the post?' },
    { severity: 'info', title: 'Switch to the new editor?' },
    { severity: 'success', title: 'Mark the order as paid?' },
    { severity: 'warn', title: 'Leave without saving?' },
    { severity: 'danger', title: 'Delete the workspace?' },
  ];

  async ask(severity: TxConfirmSeverity, title: string): Promise<void> {
    const ok = await this.confirm.dialog({ title, severity });
    this.answer.set(ok ? 'yes' : 'no');
  }
}
