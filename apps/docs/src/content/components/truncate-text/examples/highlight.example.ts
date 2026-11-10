import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxInput } from '@tectra-ng/ui/input';
import { TxTruncateText } from '@tectra-ng/ui/truncate-text';

@Component({
  selector: 'truncate-text-highlight-example',
  imports: [TxInput, TxTruncateText],
  template: `
    <input
      txInput
      aria-label="Search domains"
      placeholder="Search"
      [value]="search()"
      (input)="search.set($any($event.target).value)"
    />
    <div class="rows">
      @for (domain of domains; track domain) {
        <tx-truncate-text [text]="domain" [limit]="26" [highlight]="search()" />
      }
    </div>
  `,
  styles: `
    .rows {
      display: grid;
      justify-items: start;
      gap: 10px;
      margin-top: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TruncateTextHighlightExample {
  readonly search = signal('shop');
  readonly domains = [
    'shop.example.com',
    'summer-collection.shop.example.org',
    'blog.example.net',
    'my-long-workshop-landing.example.com',
  ];
}
