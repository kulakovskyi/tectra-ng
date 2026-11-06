import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { FormsModule } from '@angular/forms';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxDataView, TxDataViewHeader, TxDataViewList } from '@tectra-ng/ui/data-view';

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
  selector: 'data-view-filter-example',
  imports: [
    TxDataView,
    TxDataViewHeader,
    TxDataViewList,
    TxIcon,
    TxInput,
    FormsModule,
    TxIconField,
    TxInputIcon,
    TxInputClear,
  ],
  template: `
    <tx-data-view
      ariaLabel="Products"
      filterBy="name,category"
      [value]="products"
      [(filterValue)]="query"
    >
      <ng-template txDataViewHeader>
        <tx-icon-field>
          <tx-input-icon icon="search" />
          <input
            txInput
            type="search"
            aria-label="Search products"
            placeholder="Search products"
            [(ngModel)]="query"
          />
          <tx-input-clear />
        </tx-icon-field>
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
              <span class="price">{{ product.price }} €</span>
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
export default class DataViewFilterExample {
  readonly products = PRODUCTS;
  readonly query = signal('');
}
