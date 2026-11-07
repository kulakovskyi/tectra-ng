import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxGalleria, TxGalleriaCaptionTemplate, TxGalleriaImage } from '@tectra-ng/ui/galleria';

@Component({
  selector: 'galleria-caption-example',
  imports: [TxGalleria, TxGalleriaCaptionTemplate],
  template: `
    <div class="pair">
      <tx-galleria [value]="photos" [showThumbnails]="false" showItemNavigators />
      <tx-galleria [value]="photos" [showThumbnails]="false" showItemNavigators>
        <ng-template txGalleriaCaption let-photo let-index="index">
          <div class="caption">
            <span>{{ photo.title }}</span>
            <span class="count">{{ index + 1 }} / {{ photos.length }}</span>
          </div>
        </ng-template>
      </tx-galleria>
    </div>
  `,
  styles: `
    .pair {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
    }
    .caption {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-weight: 600;
    }
    .count {
      font-weight: 400;
      opacity: 0.8;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaCaptionExample {
  readonly photos: TxGalleriaImage[] = [
    {
      src: 'images/gallery/dawn.svg',
      alt: 'Dawn over the ridge',
      title: 'Dawn over the ridge',
      description: 'First light on the eastern slopes.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/lake.svg',
      alt: 'Alpine lake',
      title: 'Alpine lake',
      description: 'Still water under the north face.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/dunes.svg',
      alt: 'Desert dunes',
      title: 'Desert dunes',
      description: 'Wind-shaped sand at noon.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/forest.svg',
      alt: 'Pine forest',
      title: 'Pine forest',
      description: 'Rolling hills of evergreen trees.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/night.svg',
      alt: 'Night sky',
      title: 'Night sky',
      description: 'A clear sky far from the city.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/coast.svg',
      alt: 'Quiet coast',
      title: 'Quiet coast',
      description: 'Low tide in a sheltered bay.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/autumn.svg',
      alt: 'Autumn hills',
      title: 'Autumn hills',
      description: 'Warm colours late in October.',
      width: 1200,
      height: 800,
    },
    {
      src: 'images/gallery/arctic.svg',
      alt: 'Arctic morning',
      title: 'Arctic morning',
      description: 'Pale light over the ice fields.',
      width: 1200,
      height: 800,
    },
  ];
}
