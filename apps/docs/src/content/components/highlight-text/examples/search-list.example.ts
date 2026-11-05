import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TxHighlightText } from '@tectra/ui/highlight-text';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'highlight-text-search-list-example',
  imports: [TxHighlightText, TxInput],
  template: `
    <input
      txInput
      aria-label="Search cities"
      placeholder="Search cities"
      [value]="search()"
      (input)="search.set($any($event.target).value)"
    />
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
