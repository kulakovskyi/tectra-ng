import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';
import { TxIconField, TxInputClear, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'link-search-example',
  imports: [TxLink, TxInput, TxIconField, TxInputIcon, TxInputClear],
  template: `
    <tx-icon-field>
      <tx-input-icon icon="search" />
      <input
        txInput
        aria-label="Search links"
        placeholder="Search"
        [value]="search()"
        (input)="search.set($any($event.target).value)"
      />
      <tx-input-clear />
    </tx-icon-field>
    <ul class="list">
      @for (link of links; track link) {
        <li><tx-link [link]="link" [highlight]="search()" /></li>
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LinkSearchExample {
  readonly search = signal('shop');
  readonly links = ['shop.example.com', 'blog.example.com/shop-news', 'status.example.com'];
}
