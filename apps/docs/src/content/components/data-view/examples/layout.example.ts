import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import {
  TxDataView,
  TxDataViewGrid,
  TxDataViewHeader,
  TxDataViewLayout,
  TxDataViewLayoutSwitch,
  TxDataViewList,
} from '@tectra-ng/ui/data-view';
import { TxAmount } from '@tectra-ng/ui/amount';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  stock: 'In stock' | 'Low stock' | 'Out of stock';
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Oak desk', category: 'Furniture', price: 420, rating: 5, stock: 'In stock' },
  { id: 2, name: 'Desk lamp', category: 'Lighting', price: 65, rating: 4, stock: 'Low stock' },
  { id: 3, name: 'Office chair', category: 'Furniture', price: 280, rating: 4, stock: 'In stock' },
  { id: 4, name: 'Wall shelf', category: 'Storage', price: 90, rating: 3, stock: 'Out of stock' },
  { id: 5, name: 'Wool rug', category: 'Textiles', price: 150, rating: 5, stock: 'In stock' },
  { id: 6, name: 'Floor lamp', category: 'Lighting', price: 120, rating: 4, stock: 'In stock' },
  { id: 7, name: 'Linen curtains', category: 'Textiles', price: 75, rating: 3, stock: 'Low stock' },
  { id: 8, name: 'Bookcase', category: 'Storage', price: 310, rating: 5, stock: 'In stock' },
];

@Component({
  selector: 'data-view-layout-example',
  imports: [
    TxDataView,
    TxDataViewLayoutSwitch,
    TxDataViewHeader,
    TxDataViewList,
    TxDataViewGrid,
    TxIcon,
    TxAmount,
  ],
  template: `
    <tx-data-view ariaLabel="Products" [value]="products" [(layout)]="layout">
      <ng-template txDataViewHeader>
        <div class="bar">
          <strong>{{ products.length }} products</strong>
          <tx-data-view-layout [(layout)]="layout" />
        </div>
      </ng-template>
      <ng-template txDataViewList let-items>
        <ul class="list">
          @for (product of items; track product.id) {
            <li class="row">
              <span class="thumb" aria-hidden="true"><tx-icon name="box" /></span>
              <span class="info">
                <strong>{{ product.name }}</strong>
                <span class="muted">{{ product.category }}</span>
              </span>
              <tx-amount class="price" currency="EUR" [amount]="product.price" />
            </li>
          }
        </ul>
      </ng-template>
      <ng-template txDataViewGrid let-items>
        <ul class="cards">
          @for (product of items; track product.id) {
            <li class="card">
              <span class="thumb" aria-hidden="true"><tx-icon name="box" /></span>
              <strong>{{ product.name }}</strong>
              <span class="muted">{{ product.category }}</span>
              <tx-amount class="price" currency="EUR" [amount]="product.price" />
            </li>
          }
        </ul>
      </ng-template>
    </tx-data-view>
  `,
  styles: `
    .bar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: space-between;
      align-items: center;
    }
    .list,
    .cards {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      border-bottom: 1px solid var(--tx-surface-border);
    }
    .row:last-child {
      border-bottom: 0;
    }
    .info {
      display: grid;
      flex: 1;
      gap: 2px;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 12px;
      padding: 12px;
    }
    .card {
      display: grid;
      gap: 6px;
      padding: 12px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-lg);
    }
    .thumb {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      border-radius: var(--tx-radius-md);
      background: var(--tx-surface-hover);
      color: var(--tx-text-muted);
    }
    .muted {
      color: var(--tx-text-muted);
    }
    .price {
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DataViewLayoutExample {
  readonly products = PRODUCTS;
  readonly layout = signal<TxDataViewLayout>('grid');
}
