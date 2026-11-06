import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-states-example',
  imports: [FormsModule, TxPassword],
  template: `
    <div class="list">
      <tx-password
        [disabled]="true"
        [toggleMask]="true"
        ariaLabel="Disabled"
        [ngModel]="'hunter22'"
      />
      <tx-password
        [readonly]="true"
        [toggleMask]="true"
        ariaLabel="Read only"
        [ngModel]="'hunter22'"
      />
      <tx-password [invalid]="true" placeholder="Invalid" ariaLabel="Invalid" />
    </div>
  `,
  styles: `
    .list {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordStatesExample {}
