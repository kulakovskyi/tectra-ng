import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPassword, TxPasswordStrength } from '@tectra/ui/password';

@Component({
  selector: 'password-meter-example',
  imports: [TxPassword],
  template: `
    <tx-password
      [feedback]="true"
      [toggleMask]="true"
      autocomplete="new-password"
      placeholder="New password"
      ariaLabel="New password"
      (strengthChange)="strength.set($event)"
    />
    <p class="hint">Strength: {{ strength() ?? '—' }}</p>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordMeterExample {
  readonly strength = signal<TxPasswordStrength | null>(null);
}
