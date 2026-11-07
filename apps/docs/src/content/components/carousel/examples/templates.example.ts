import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxCarousel,
  TxCarouselFooter,
  TxCarouselHeader,
  TxCarouselIndicatorTemplate,
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
  selector: 'carousel-templates-example',
  imports: [
    TxCarousel,
    TxCarouselItemTemplate,
    TxCarouselIndicatorTemplate,
    TxCarouselHeader,
    TxCarouselFooter,
  ],
  template: `
    <tx-carousel
      ariaLabel="Trip photos"
      [value]="photos"
      [numVisible]="2"
      [responsiveOptions]="responsive"
      [numScroll]="2"
      [(page)]="page"
      [dt]="{ indicator: { width: '22px', height: '22px', borderRadius: '50%' } }"
    >
      <div txCarouselHeader class="header">
        <strong>Trip photos</strong>
        <span>{{ photos.length }} photos</span>
      </div>
      <ng-template txCarouselItem let-photo>
        <img class="photo" [src]="photo.src" [alt]="photo.alt" />
      </ng-template>
      <ng-template txCarouselIndicator let-index let-active="active">
        <span class="number" [class.active]="active">{{ index + 1 }}</span>
      </ng-template>
      <p txCarouselFooter class="footer">Page {{ page() + 1 }} · swipe or use the arrows</p>
    </tx-carousel>
  `,
  styles: `
    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      padding: 0 8px 8px;
    }
    .header span,
    .footer {
      color: var(--tx-text-muted);
      font-size: 13px;
    }
    .footer {
      margin: 0;
      text-align: center;
    }
    .photo {
      display: block;
      width: calc(100% - 12px);
      margin: 0 6px;
      border-radius: 10px;
    }
    .number {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
      font-size: 11px;
      font-weight: 600;
      color: var(--tx-text-primary);
    }
    .number.active {
      color: var(--tx-primary-contrast);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselTemplatesExample {
  readonly responsive: TxCarouselResponsiveOption[] = [
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
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
  readonly page = signal(0);
}
