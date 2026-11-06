import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxHighlightText } from '@tectra-ng/ui/highlight-text';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'highlight-text-search-list-example',
  imports: [TxHighlightText, TxInput, TxIconField, TxInputIcon, TxInputClear],
  template: `
    <tx-icon-field>
      <tx-input-icon icon="search" />
      <input
        txInput
        aria-label="Search cities"
        placeholder="Search cities"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />
      <tx-input-clear />
    </tx-icon-field>
    <ul class="list">
      @for (city of visible(); track city) {
        <li><tx-highlight-text [text]="city" [highlight]="search()" /></li>
      } @empty {
        <li class="empty">No cities found</li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 12px 0 0;
      padding: 0;
      list-style: none;
      font-size: 14px;
    }
    .empty {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HighlightTextSearchListExample {
  readonly search = signal('iv');
  readonly cities = ['Kyiv', 'Lviv', 'Kharkiv', 'Odesa', 'Dnipro', 'Ivano-Frankivsk', 'Chernivtsi'];
  readonly visible = computed(() => {
    const query = this.search().trim().toLowerCase();
    return query ? this.cities.filter((city) => city.toLowerCase().includes(query)) : this.cities;
  });
}
