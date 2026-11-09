import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxQrCode } from '@tectra-ng/blocks/qr-code';
import { TxField } from '@tectra-ng/ui/field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'qr-code-basic-example',
  imports: [FormsModule, TxQrCode, TxField, TxInput],
  template: `
    <div class="row">
      <tx-qr-code [data]="text()" />
      <tx-field class="field" label="Text" hint="The code updates as you type.">
        <input txInput fluid [(ngModel)]="text" />
      </tx-field>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }

    .field {
      flex: 1 1 240px;
      max-width: 360px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeBasicExample {
  readonly text = signal('https://example.com/r/7Q2M');
}
