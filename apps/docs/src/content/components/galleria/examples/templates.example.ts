import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxGalleria,
  TxGalleriaFooter,
  TxGalleriaHeader,
  TxGalleriaItemTemplate,
  TxGalleriaResponsiveOption,
  TxGalleriaThumbnailTemplate,
} from '@tectra-ng/ui/galleria';

interface Destination {
  place: string;
  region: string;
  days: number;
  image: string;
}

@Component({
  selector: 'galleria-templates-example',
  imports: [
    TxGalleria,
    TxGalleriaItemTemplate,
    TxGalleriaThumbnailTemplate,
    TxGalleriaHeader,
    TxGalleriaFooter,
  ],
  template: `
    <tx-galleria
      [value]="trips"
      [numVisible]="4"
      [responsiveOptions]="responsive"
      [(activeIndex)]="active"
      showItemNavigators
      [dt]="{ thumbnails: { itemOpacity: '1' } }"
    >
      <div txGalleriaHeader class="header">Trips this year</div>
      <ng-template txGalleriaItem let-trip>
        <figure class="trip">
          <img [src]="trip.image" [alt]="trip.place" width="1200" height="800" />
          <figcaption>
            <strong>{{ trip.place }}</strong>
            <span>{{ trip.region }} · {{ trip.days }} days</span>
          </figcaption>
        </figure>
      </ng-template>
      <ng-template txGalleriaThumbnail let-trip let-active="active">
        <span class="chip" [class.active]="active">{{ trip.place }}</span>
      </ng-template>
      <div txGalleriaFooter class="footer">{{ trips[active()].days }} days on the road</div>
    </tx-galleria>
  `,
  styles: `
    tx-galleria {
      max-width: 640px;
    }
    .header,
    .footer {
      padding: 10px 14px;
      font-size: 13px;
      color: var(--tx-text-muted);
    }
    .header {
      font-weight: 600;
      color: var(--tx-text-primary);
    }
    .trip {
      position: relative;
      width: 100%;
      margin: 0;
    }
    .trip img {
      display: block;
      width: 100%;
      height: auto;
    }
    .trip figcaption {
      position: absolute;
      inset: auto 0 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 12px 14px;
      background: linear-gradient(transparent, rgba(0, 0, 0, 0.6));
      color: var(--tx-surface-0);
    }
    .chip {
      display: block;
      padding: 6px 10px;
      border-radius: 7px;
      background: var(--tx-surface-ground);
      color: var(--tx-text-primary);
      font-size: 13px;
      white-space: nowrap;
    }
    .chip.active {
      background: var(--tx-primary-base);
      color: var(--tx-primary-contrast);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GalleriaTemplatesExample {
  readonly responsive: TxGalleriaResponsiveOption[] = [{ breakpoint: '560px', numVisible: 2 }];
  readonly trips: Destination[] = [
    { place: 'Ridge', region: 'Highlands', days: 4, image: 'images/gallery/dawn.svg' },
    { place: 'Lake', region: 'Alps', days: 6, image: 'images/gallery/lake.svg' },
    { place: 'Dunes', region: 'South', days: 3, image: 'images/gallery/dunes.svg' },
    { place: 'Forest', region: 'North', days: 5, image: 'images/gallery/forest.svg' },
    { place: 'Coast', region: 'West', days: 7, image: 'images/gallery/coast.svg' },
  ];
  readonly active = signal(0);
}
