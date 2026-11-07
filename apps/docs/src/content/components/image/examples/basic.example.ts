import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxImage } from '@tectra-ng/ui/image';

@Component({
  selector: 'image-basic-example',
  imports: [TxImage],
  template: `<tx-image
    src="images/gallery/lake.svg"
    alt="Alpine lake"
    width="320"
    height="213"
    loading="lazy"
  />`,
  styles: `
    tx-image {
      border-radius: 10px;
      overflow: hidden;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageBasicExample {}
