import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCarousel, TxCarouselItemTemplate } from '@tectra-ng/ui/carousel';

interface Product {
  name: string;
  price: number;
  image: string;
  tag: string;
}

@Component({
  selector: 'carousel-vertical-example',
  imports: [TxCarousel, TxCarouselItemTemplate],
  template: `
    <tx-carousel
      ariaLabel="Prints"
      orientation="vertical"
      verticalViewPortHeight="380px"
      [value]="products"
      [numVisible]="1"
    >
      <ng-template txCarouselItem let-product>
        <article class="card">
          <img [src]="product.image" alt="" />
          <h3>{{ product.name }}</h3>
          <span class="price">\${{ product.price }}</span>
        </article>
      </ng-template>
    </tx-carousel>
  `,
  styles: `
    :host {
      display: block;
      max-width: 340px;
    }
    .card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin: 1px 6px;
      padding: 10px;
      border: 1px solid var(--tx-surface-border);
      border-radius: 10px;
      background: var(--tx-surface-card);
    }
    .card img {
      display: block;
      width: 100%;
      aspect-ratio: 3 / 2;
      border-radius: 7px;
      object-fit: cover;
    }
    .card h3 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .card {
      margin: 6px 1px;
    }
    .price {
      color: var(--tx-text-muted);
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselVerticalExample {
  readonly products: Product[] = [
    { name: 'Ridge trail map', price: 18, image: 'images/gallery/dawn.svg', tag: 'New' },
    { name: 'Lake shore print', price: 42, image: 'images/gallery/lake.svg', tag: 'Popular' },
    { name: 'Dune postcard set', price: 12, image: 'images/gallery/dunes.svg', tag: 'Sale' },
    { name: 'Forest notebook', price: 9, image: 'images/gallery/forest.svg', tag: 'New' },
    { name: 'Night sky poster', price: 35, image: 'images/gallery/night.svg', tag: 'Popular' },
    { name: 'Coast calendar', price: 21, image: 'images/gallery/coast.svg', tag: 'Sale' },
    { name: 'Autumn journal', price: 14, image: 'images/gallery/autumn.svg', tag: 'New' },
  ];
}
