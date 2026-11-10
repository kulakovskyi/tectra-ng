import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-types-example',
  imports: [TxListInput],
  template: `
    <div class="fields">
      <tx-list-input
        type="email"
        ariaLabel="Emails"
        [rows]="3"
        text="Olena@Example.com, taras@example.org&#10;olena@example.com not-an-email"
      />
      <tx-list-input
        type="url"
        ariaLabel="Links"
        [rows]="3"
        text="example.com/pricing&#10;https://example.org/blog?page=2 ftp://example.net"
      />
      <tx-list-input type="text" ariaLabel="Tags" [rows]="3" text="spring, sale; spring&#10;new" />
    </div>
  `,
  styles: `
    .fields {
      display: grid;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputTypesExample {}
