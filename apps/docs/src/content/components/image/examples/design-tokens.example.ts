import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxImage } from '@tectra-ng/ui/image';

@Component({
  selector: 'image-design-tokens-example',
  imports: [TxImage],
  template: `
    <tx-image
      src="images/gallery/forest.svg"
      alt="Pine forest"
      width="320"
      height="213"
      preview
      [dt]="{
        toolbar: {
          background: 'var(--tx-surface-950)',
          borderRadius: '10px',
          borderColor: 'transparent',
        },
        action: { borderRadius: '7px' },
        preview: { background: 'rgba(0, 0, 0, 0.8)' },
      }"
    />
  `,
  styles: `
    tx-image {
      border-radius: 10px;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageDesignTokensExample {}
