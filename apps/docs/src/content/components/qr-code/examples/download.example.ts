import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxQrCode } from '@tectra-ng/blocks/qr-code';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'qr-code-download-example',
  imports: [TxQrCode, TxButton],
  template: `
    <div class="row">
      <tx-qr-code #qr data="WIFI:T:WPA;S:Office;P:correct horse battery;;" dotStyle="soft" />
      <div class="actions">
        <button txButton icon="download" (click)="qr.download('png', 'office-wifi')">
          Download PNG
        </button>
        <button
          txButton
          severity="secondary"
          outlined
          icon="download"
          (click)="qr.download('svg', 'office-wifi')"
        >
          Download SVG
        </button>
        <button txButton severity="secondary" text icon="copy" (click)="copy(qr.toSvgString())">
          {{ copied() ? 'Copied' : 'Copy SVG' }}
        </button>
      </div>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 24px;
    }

    .actions {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeDownloadExample {
  readonly copied = signal(false);

  async copy(svg: string): Promise<void> {
    await navigator.clipboard.writeText(svg);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 1500);
  }
}
