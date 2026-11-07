import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxImage } from '@tectra-ng/ui/image';

@Component({
  selector: 'image-zoom-example',
  imports: [TxImage],
  template: `
    <tx-image
      src="images/gallery/night.svg"
      previewSrc="images/gallery/night.svg"
      alt="Night sky"
      width="240"
      height="160"
      preview
      [zoomStep]="0.25"
      [minZoom]="0.5"
      [maxZoom]="3"
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
export default class ImageZoomExample {}
