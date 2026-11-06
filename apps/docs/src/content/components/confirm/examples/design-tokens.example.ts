import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxConfirmService } from '@tectra-ng/ui/confirm';

@Component({
  selector: 'confirm-design-tokens-example',
  imports: [TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="ask($event)">
      Archive the project
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmDesignTokensExample {
  private confirm = inject(TxConfirmService);

  ask(event: Event): void {
    void this.confirm.popup(event, {
      title: 'Archive the project?',
      message: 'You can restore it later.',
      severity: 'warn',
      acceptLabel: 'Archive',
      dt: {
        popup: { borderRadius: '16px', padding: '16px', maxWidth: '280px' },
        icon: { fontSize: '16px' },
      },
    });
  }
}
