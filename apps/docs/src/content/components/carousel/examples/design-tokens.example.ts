import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  TxCarousel,
  TxCarouselItemTemplate,
  TxCarouselResponsiveOption,
} from '@tectra-ng/ui/carousel';

interface Photo {
  src: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'carousel-design-tokens-example',
  imports: [TxCarousel, TxCarouselItemTemplate],
  template: `
    <tx-carousel
      ariaLabel="Landscapes"
      [value]="photos"
      [numVisible]="3"
      [responsiveOptions]="responsive"
      [dt]="{
        root: { slideDuration: '0.3s' },
        indicator: {
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          activeBackground: 'var(--tx-help-base)',
        },
      }"
    >
      <ng-template txCarouselItem let-photo>
        <img class="photo" [src]="photo.src" [alt]="photo.alt" />
      </ng-template>
    </tx-carousel>
  `,
  styles: `
    .photo {
      display: block;
      width: calc(100% - 8px);
      margin: 0 4px;
      border-radius: 10px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselDesignTokensExample {
  readonly responsive: TxCarouselResponsiveOption[] = [
    { breakpoint: '768px', numVisible: 2 },
    { breakpoint: '560px', numVisible: 1 },
  ];
  readonly photos: Photo[] = [
    {
      src: 'images/gallery/dawn.svg',
      alt: 'Dawn over the ridge',
      title: 'Dawn over the ridge',
      description: 'First light on the eastern slopes.',
    },
    {
      src: 'images/gallery/lake.svg',
      alt: 'Alpine lake',
      title: 'Alpine lake',
      description: 'Still water under the north face.',
    },
    {
      src: 'images/gallery/dunes.svg',
      alt: 'Desert dunes',
      title: 'Desert dunes',
      description: 'Wind-shaped sand at noon.',
    },
    {
      src: 'images/gallery/forest.svg',
      alt: 'Pine forest',
      title: 'Pine forest',
      description: 'Rolling hills of evergreen trees.',
    },
    {
      src: 'images/gallery/night.svg',
      alt: 'Night sky',
      title: 'Night sky',
      description: 'A clear sky far from the city.',
    },
    {
      src: 'images/gallery/coast.svg',
      alt: 'Quiet coast',
      title: 'Quiet coast',
      description: 'Low tide in a sheltered bay.',
    },
    {
      src: 'images/gallery/autumn.svg',
      alt: 'Autumn hills',
      title: 'Autumn hills',
      description: 'Warm colours late in October.',
    },
    {
      src: 'images/gallery/arctic.svg',
      alt: 'Arctic morning',
      title: 'Arctic morning',
      description: 'Pale light over the ice fields.',
    },
  ];
}
