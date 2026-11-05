import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxInput } from '@tectra/ui/input';
import { TxLabel } from '@tectra/ui/label';
import { TxFieldHint } from '@tectra/ui/message';

@Component({
  selector: 'message-field-hint-example',
  imports: [TxLabel, TxInput, TxFieldHint],
  template: `
    <div class="form">
      <div>
        <tx-label for="hint-username">Username</tx-label>
        <input txInput id="hint-username" [fluid]="true" />
        <tx-field-hint for="hint-username"
          >Letters, numbers and dashes. You can change it later.</tx-field-hint
        >
      </div>
      <div>
        <tx-label for="hint-domain">Domain</tx-label>
        <input txInput id="hint-domain" value="docs.example.com" [fluid]="true" />
        <tx-field-hint for="hint-domain" severity="success" icon="check-circle"
          >DNS records found</tx-field-hint
        >
      </div>
    </div>
  `,
  styles: `
    .form {
      display: grid;
      gap: 20px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageFieldHintExample {}
