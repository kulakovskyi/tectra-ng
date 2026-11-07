import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import {
  TxCarousel,
  TxCarouselItemTemplate,
  TxCarouselResponsiveOption,
} from '@tectra-ng/ui/carousel';
import { TxTag } from '@tectra-ng/ui/tag';

interface Product {
  name: string;
  price: number;
  image: string;
  tag: string;
}

@Component({
  selector: 'carousel-basic-example',
  imports: [TxCarousel, TxCarouselItemTemplate, TxButton, TxTag],
  template: `
    <tx-carousel
      ariaLabel="New arrivals"
      [value]="products"
      [numVisible]="3"
      [responsiveOptions]="responsive"
      [numScroll]="1"
      [(page)]="page"
    >
      <ng-template txCarouselItem let-product>
        <article class="card">
          <img [src]="product.image" alt="" />
          <h3>{{ product.name }}</h3>
          <div class="row">
            <tx-tag [value]="product.tag" severity="secondary" />
            <button txButton size="small" (click)="added.set(product.name)">
              \${{ product.price }}
            </button>
          </div>
        </article>
      </ng-template>
    </tx-carousel>
    <p class="status">Page {{ page() + 1 }} · last added: {{ added() }}</p>
  `,
  styles: `
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
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .status {
      margin: 4px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CarouselBasicExample {
  readonly responsive: TxCarouselResponsiveOption[] = [
    { breakpoint: '768px', numVisible: 2, numScroll: 1 },
    { breakpoint: '560px', numVisible: 1, numScroll: 1 },
  ];
  readonly products: Product[] = [
    { name: 'Ridge trail map', price: 18, image: 'images/gallery/dawn.svg', tag: 'New' },
    { name: 'Lake shore print', price: 42, image: 'images/gallery/lake.svg', tag: 'Popular' },
    { name: 'Dune postcard set', price: 12, image: 'images/gallery/dunes.svg', tag: 'Sale' },
    { name: 'Forest notebook', price: 9, image: 'images/gallery/forest.svg', tag: 'New' },
    { name: 'Night sky poster', price: 35, image: 'images/gallery/night.svg', tag: 'Popular' },
    { name: 'Coast calendar', price: 21, image: 'images/gallery/coast.svg', tag: 'Sale' },
    { name: 'Autumn journal', price: 14, image: 'images/gallery/autumn.svg', tag: 'New' },
  ];
  readonly page = signal(0);
  readonly added = signal('nothing');
}
