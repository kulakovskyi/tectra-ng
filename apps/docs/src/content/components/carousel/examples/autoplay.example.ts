import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCarousel, TxCarouselItemTemplate } from '@tectra-ng/ui/carousel';

interface Photo {
  src: string;
  alt: string;
  title: string;
  description: string;
}

@Component({
  selector: 'carousel-autoplay-example',
  imports: [TxCarousel, TxCarouselItemTemplate, TxButton],
  template: `
    <tx-carousel
      ariaLabel="Landscapes"
      [value]="photos"
      [autoplayInterval]="3000"
      [showNavigators]="false"
    >
      <ng-template txCarouselItem let-photo>
        <figure class="slide">
          <img [src]="photo.src" [alt]="photo.alt" />
          <figcaption>{{ photo.title }}</figcaption>
        </figure>
      </ng-template>
    </tx-carousel>
    <div class="actions">
      <button
        txButton
        size="small"
        severity="secondary"
        icon="play"
        (click)="carousel().startAutoplay()"
      >
        Play
      </button>
      <button
        txButton
        size="small"
        severity="secondary"
        icon="pause"
        (click)="carousel().stopAutoplay()"
      >
        Pause
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 560px;
    }
    .slide {
      position: relative;
      margin: 0;
    }
    .slide img {
      display: block;
      width: 100%;
      border-radius: 10px;
    }
    .slide figcaption {
      position: absolute;
      left: 12px;
      bottom: 12px;
      padding: 4px 10px;
      border-radius: 7px;
      background: rgba(0, 0, 0, 0.55);
      color: var(--tx-surface-0);
      font-size: 13px;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselAutoplayExample {
  readonly carousel = viewChild.required(TxCarousel);
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
