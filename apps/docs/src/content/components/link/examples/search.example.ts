import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxLink } from '@tectra-ng/ui/link';
import { TxInput } from '@tectra-ng/ui/input';

@Component({
  selector: 'link-search-example',
  imports: [TxLink, TxInput],
  template: `
    <input
      txInput
      aria-label="Search links"
      placeholder="Search"
      [value]="search()"
      (input)="search.set($any($event.target).value)"
    />
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
