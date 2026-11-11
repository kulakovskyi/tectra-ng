import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputGroup } from '@tectra-ng/ui/input-group';
import { TxCopy } from '@tectra-ng/utils/clipboard';

@Component({
  selector: 'clipboard-basic-example',
  imports: [TxButton, TxInput, TxInputGroup, TxCopy],
  template: `
    <tx-input-group class="field">
      <input txInput readonly aria-label="Invite link" [value]="invite" />
      <button txButton icon="copy" aria-label="Copy invite link" [txCopy]="invite"></button>
    </tx-input-group>
  `,
  styles: `
    .field {
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ClipboardBasicExample {
  readonly invite = 'https://example.com/invite/7f3a-21c9';
}
