import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { qrToSvg } from '@tectra-ng/qr';

@Component({
  selector: 'qr-code-plain-svg-example',
  template: `<div class="code" [innerHTML]="svg"></div>`,
  styles: `
    .code {
      display: inline-flex;
      border-radius: 10px;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodePlainSvgExample {
  readonly svg: SafeHtml = inject(DomSanitizer).bypassSecurityTrustHtml(
    qrToSvg('https://example.com/invite/42', {
      size: 180,
      dotStyle: 'dots',
      eyeFrameStyle: 'rounded',
      eyeBallStyle: 'rounded',
      color: '#0f766e',
      title: 'Invite link',
    }),
  );
}
