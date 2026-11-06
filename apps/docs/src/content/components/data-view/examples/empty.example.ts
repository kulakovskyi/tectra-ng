import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxDataView, TxDataViewEmpty, TxDataViewList } from '@tectra-ng/ui/data-view';

@Component({
  selector: 'data-view-empty-example',
  imports: [TxDataView, TxDataViewEmpty, TxDataViewList, TxIcon],
  template: `
    <tx-data-view ariaLabel="Saved products" [value]="[]">
      <ng-template txDataViewEmpty>
        <div class="empty">
          <tx-icon name="inbox" />
          <span>No saved products yet</span>
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
    .empty {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DataViewEmptyExample {}
