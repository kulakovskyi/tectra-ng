import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxPassword, TxPasswordContentTemplate } from '@tectra/ui/password';

@Component({
  selector: 'password-requirements-example',
  imports: [TxPassword, TxPasswordContentTemplate, TxIcon],
  template: `
    <tx-password
      [feedback]="true"
      [toggleMask]="true"
      autocomplete="new-password"
      placeholder="New password"
      ariaLabel="New password"
    >
      <ng-template txPasswordContent let-value="value">
        <ul class="rules">
          @for (rule of rules; track rule.text) {
            <li [class.done]="rule.test(value)">
              <tx-icon [name]="rule.test(value) ? 'check' : 'minus'" />
              {{ rule.text }}
            </li>
          }
        </ul>
      </ng-template>
    </tx-password>
  `,
  styles: `
    .rules {
      display: grid;
      gap: 4px;
      margin: 4px 0 0;
      padding: 0;
      list-style: none;
      color: var(--tx-text-muted);
    }

    .rules li {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .rules .done {
      color: var(--tx-text-primary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordRequirementsExample {
  readonly rules = [
    { text: 'At least 8 characters', test: (value: string) => value.length >= 8 },
    { text: 'An upper case letter', test: (value: string) => /[A-Z]/.test(value) },
    { text: 'A number', test: (value: string) => /\d/.test(value) },
  ];
}
