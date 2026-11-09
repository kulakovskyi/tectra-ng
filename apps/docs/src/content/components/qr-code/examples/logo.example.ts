import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxQrCode } from '@tectra-ng/blocks/qr-code';

@Component({
  selector: 'qr-code-logo-example',
  imports: [TxQrCode],
  template: `
    <div class="grid">
      <tx-qr-code data="https://example.com/app" logo="/favicon.svg" [size]="180" />
      <tx-qr-code
        data="https://example.com/app"
        logo="/favicon.svg"
        dotStyle="rounded"
        eyeFrameStyle="rounded"
        eyeBallStyle="rounded"
        color="#1d4ed8"
        [size]="180"
        [logoSize]="0.28"
        [logoMargin]="0"
      />
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeLogoExample {}
