import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxImage, TxImageIndicatorTemplate, TxImagePreviewTemplate } from '@tectra-ng/ui/image';

@Component({
  selector: 'image-templates-example',
  imports: [TxImage, TxImageIndicatorTemplate, TxImagePreviewTemplate, TxIcon, TxButton],
  template: `
    <tx-image src="images/gallery/coast.svg" alt="Quiet coast" width="320" height="213" preview>
      <ng-template txImageIndicator>
        <span class="indicator"><tx-icon name="search-plus" /> View full size</span>
      </ng-template>
      <ng-template txImagePreview let-src let-style="style" let-close="close">
        <figure class="figure">
          <img [src]="src" alt="Quiet coast" [style]="style" />
          <figcaption>
            Low tide in a sheltered bay
            <button txButton size="small" severity="secondary" (click)="close()">Done</button>
          </figcaption>
        </figure>
      </ng-template>
    </tx-image>
  `,
  styles: `
    tx-image {
      border-radius: 10px;
      overflow: hidden;
    }
    .indicator {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-weight: 600;
    }
    .figure {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      margin: 0;
    }
    .figure img {
      max-width: min(720px, 80vw);
      max-height: 70vh;
      transition: transform 0.15s;
    }
    .figure figcaption {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--tx-surface-0);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ImageTemplatesExample {}
