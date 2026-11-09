import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxQrCode,
  TxQrDotStyle,
  TxQrEyeBallStyle,
  TxQrEyeFrameStyle,
} from '@tectra-ng/blocks/qr-code';

interface Variant {
  name: string;
  dots: TxQrDotStyle;
  frame: TxQrEyeFrameStyle;
  ball: TxQrEyeBallStyle;
}

@Component({
  selector: 'qr-code-styles-example',
  imports: [TxQrCode],
  template: `
    <div class="grid">
      @for (variant of variants; track variant.name) {
        <figure>
          <tx-qr-code
            data="https://example.com/r/7Q2M"
            [size]="150"
            [dotStyle]="variant.dots"
            [eyeFrameStyle]="variant.frame"
            [eyeBallStyle]="variant.ball"
          />
          <figcaption>{{ variant.name }}</figcaption>
        </figure>
      }
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }

    figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      margin: 0;
    }

    figcaption {
      color: var(--tx-text-muted);
      font-size: var(--tx-font-size-sm);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class QrCodeStylesExample {
  readonly variants: Variant[] = [
    { name: 'Square', dots: 'square', frame: 'square', ball: 'square' },
    { name: 'Rounded', dots: 'rounded', frame: 'rounded', ball: 'rounded' },
    { name: 'Dots', dots: 'dots', frame: 'circle', ball: 'circle' },
    { name: 'Soft', dots: 'soft', frame: 'rounded', ball: 'circle' },
  ];
}
