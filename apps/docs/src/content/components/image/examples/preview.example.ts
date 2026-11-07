import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxImage } from '@tectra-ng/ui/image';

@Component({
  selector: 'image-preview-example',
  imports: [TxImage],
  template: `
    <tx-image
      src="images/gallery/dawn.svg"
      alt="Dawn over the ridge"
      width="320"
      height="213"
      preview
      (opened)="status.set('Preview open')"
      (closed)="status.set('Preview closed')"
    />
    <p class="status">{{ status() }}</p>
  `,
  styles: `
    tx-image {
      border-radius: 10px;
      overflow: hidden;
    }
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImagePreviewExample {
  readonly status = signal('Hover the image and press the eye');
}
