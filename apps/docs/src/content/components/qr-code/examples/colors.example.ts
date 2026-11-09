import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxQrCode } from '@tectra-ng/blocks/qr-code';

@Component({
  selector: 'qr-code-colors-example',
  imports: [TxQrCode],
  template: `
    <div class="grid">
      <tx-qr-code data="https://example.com" [size]="150" color="#1e3a8a" eyeColor="#dc2626" />
      <tx-qr-code
        data="https://example.com"
        dotStyle="dots"
        eyeFrameStyle="circle"
        eyeBallStyle="circle"
        [size]="150"
        [gradient]="{ type: 'linear', colors: ['#7c3aed', '#db2777'], rotation: 45 }"
      />
      <tx-qr-code
        data="https://example.com"
        dotStyle="rounded"
        eyeFrameStyle="rounded"
        [size]="150"
        background="#fef3c7"
        eyeBallColor="#b45309"
        [gradient]="{ type: 'radial', colors: ['#92400e', '#1c1917'] }"
      />
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeColorsExample {}
