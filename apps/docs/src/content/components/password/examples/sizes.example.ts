import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPassword } from '@tectra-ng/ui/password';

@Component({
  selector: 'password-sizes-example',
  imports: [TxPassword],
  template: `
    <div class="list">
      <tx-password size="small" [toggleMask]="true" placeholder="Small" ariaLabel="Small" />
      <tx-password [toggleMask]="true" placeholder="Medium" ariaLabel="Medium" />
      <tx-password size="large" [toggleMask]="true" placeholder="Large" ariaLabel="Large" />
      <tx-password variant="filled" [toggleMask]="true" placeholder="Filled" ariaLabel="Filled" />
    </div>
  `,
  styles: `
    .list {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PasswordSizesExample {}
