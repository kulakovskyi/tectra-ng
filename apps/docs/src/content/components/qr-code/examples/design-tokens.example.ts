import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxQrCode } from '@tectra-ng/blocks/qr-code';

@Component({
  selector: 'qr-code-design-tokens-example',
  imports: [TxQrCode],
  template: `
    <tx-qr-code
      data="https://example.com"
      [margin]="3"
      [dt]="{
        root: {
          color: 'var(--tx-primary-base)',
          background: 'var(--tx-surface-0)',
          borderRadius: '20px',
        },
      }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeDesignTokensExample {}
